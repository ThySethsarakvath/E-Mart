[CmdletBinding()]
param(
  [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
$backendDirectory = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $backendDirectory '.env'

function Read-DotEnv {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Environment file not found: $Path"
  }

  $values = @{}
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
      continue
    }

    $key = $matches[1]
    $value = $matches[2].Trim()
    if (
      $value.Length -ge 2 -and
      (($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'")))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    $values[$key] = $value
  }

  return $values
}

function ConvertFrom-PostgresUrl {
  param(
    [string]$Name,
    [string]$ConnectionString
  )

  if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    throw "$Name is missing from Backend/.env."
  }

  try {
    $uri = [Uri]$ConnectionString
  } catch {
    throw "$Name is not a valid PostgreSQL connection URL."
  }

  if ($uri.Scheme -notin @('postgres', 'postgresql')) {
    throw "$Name must start with postgres:// or postgresql://."
  }

  $credentials = $uri.UserInfo.Split(':', 2)
  if ($credentials.Count -ne 2) {
    throw "$Name must contain both a username and password."
  }

  $database = [Uri]::UnescapeDataString($uri.AbsolutePath.TrimStart('/'))
  if ([string]::IsNullOrWhiteSpace($database)) {
    throw "$Name must include a database name."
  }

  return @{
    Host = $uri.Host
    Port = if ($uri.IsDefaultPort) { '5432' } else { $uri.Port.ToString() }
    User = [Uri]::UnescapeDataString($credentials[0])
    Password = [Uri]::UnescapeDataString($credentials[1])
    Database = $database
  }
}

function Invoke-Compose {
  param([string[]]$Arguments)

  & docker compose @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Docker Compose command failed: docker compose $($Arguments -join ' ')"
  }
}

function Invoke-DatabaseCommand {
  param(
    [string]$Service,
    [hashtable]$Connection,
    [string[]]$Command,
    [switch]$CaptureOutput
  )

  $arguments = @(
    'exec',
    '-T',
    '-e', "PGHOST=$($Connection.Host)",
    '-e', "PGPORT=$($Connection.Port)",
    '-e', "PGUSER=$($Connection.User)",
    '-e', "PGPASSWORD=$($Connection.Password)",
    '-e', "PGDATABASE=$($Connection.Database)",
    '-e', 'PGSSLMODE=require',
    $Service
  ) + $Command

  if ($CaptureOutput) {
    $output = & docker compose @arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Database command failed for $Service."
    }
    return ($output | Out-String).Trim()
  }

  & docker compose @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Database command failed for $Service."
  }
}

function Restore-Database {
  param(
    [string]$Service,
    [string]$LocalUser,
    [string]$LocalDatabase,
    [string]$DumpPath
  )

  Write-Host "Replacing local database '$LocalDatabase'..."
  Invoke-Compose @(
    'exec', '-T', $Service,
    'dropdb', '--if-exists', '--force', '-U', $LocalUser, $LocalDatabase
  )
  Invoke-Compose @(
    'exec', '-T', $Service,
    'createdb', '-U', $LocalUser, '-O', $LocalUser, $LocalDatabase
  )
  Invoke-Compose @(
    'exec', '-T', $Service,
    'pg_restore', '--exit-on-error', '--no-owner', '--no-privileges',
    '-U', $LocalUser, '-d', $LocalDatabase, $DumpPath
  )
  Invoke-Compose @(
    'exec', '-T', $Service,
    'vacuumdb', '--analyze-only', '-U', $LocalUser, '-d', $LocalDatabase
  )
}

function Update-LocalAuthSchema {
  $sql = @'
ALTER TABLE public.refresh_tokens
  ALTER COLUMN token TYPE text USING token::text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.refresh_tokens'::regclass
      AND contype = 'u'
      AND conkey = ARRAY[
        (SELECT attnum
         FROM pg_attribute
         WHERE attrelid = 'public.refresh_tokens'::regclass
           AND attname = 'token')
      ]::smallint[]
  ) THEN
    ALTER TABLE public.refresh_tokens
      ADD CONSTRAINT "UQ_refresh_tokens_token" UNIQUE (token);
  END IF;
END
$$;
'@

  Write-Host 'Applying local auth schema compatibility updates...'
  Invoke-Compose @(
    'exec', '-T', 'auth-db',
    'psql', '--set=ON_ERROR_STOP=1',
    '-U', $settings['AUTH_DB_USER'],
    '-d', $settings['AUTH_DB_NAME'],
    '-c', $sql
  )
}

Set-Location $backendDirectory
$settings = Read-DotEnv -Path $envPath
$emartSource = ConvertFrom-PostgresUrl `
  -Name 'NEON_EMART_DATABASE_URL' `
  -ConnectionString $settings['NEON_EMART_DATABASE_URL']
$authSource = ConvertFrom-PostgresUrl `
  -Name 'NEON_AUTH_DATABASE_URL' `
  -ConnectionString $settings['NEON_AUTH_DATABASE_URL']

Write-Host 'Checking local PostgreSQL containers...'
Invoke-Compose @('up', '-d', 'emart-db', 'auth-db')

$sources = @(
  @{
    Label = 'E-Mart'
    Service = 'emart-db'
    Connection = $emartSource
  },
  @{
    Label = 'Auth'
    Service = 'auth-db'
    Connection = $authSource
  }
)

foreach ($source in $sources) {
  $version = Invoke-DatabaseCommand `
    -Service $source.Service `
    -Connection $source.Connection `
    -Command @('psql', '-Atqc', 'SHOW server_version;') `
    -CaptureOutput
  Write-Host "$($source.Label) Neon connection succeeded (PostgreSQL $version)."
}

if ($CheckOnly) {
  Write-Host 'Both Neon connections are valid. No local data was changed.'
  exit 0
}

$emartDump = '/tmp/neon-emart.dump'
$authDump = '/tmp/neon-auth.dump'

Write-Host 'Creating E-Mart dump from Neon...'
Invoke-DatabaseCommand `
  -Service 'emart-db' `
  -Connection $emartSource `
  -Command @(
    'pg_dump', '--format=custom', '--no-owner', '--no-privileges',
    "--file=$emartDump"
  )

Write-Host 'Creating auth dump from Neon...'
Invoke-DatabaseCommand `
  -Service 'auth-db' `
  -Connection $authSource `
  -Command @(
    'pg_dump', '--format=custom', '--no-owner', '--no-privileges',
    "--file=$authDump"
  )

Write-Host 'Both Neon dumps completed. Stopping E-Mart application services...'
Invoke-Compose @('stop', 'api-gateway', 'auth-service', 'order-worker')

$restoreSucceeded = $false
try {
  Restore-Database `
    -Service 'emart-db' `
    -LocalUser $settings['EMART_DB_USER'] `
    -LocalDatabase $settings['EMART_DB_NAME'] `
    -DumpPath $emartDump
  Restore-Database `
    -Service 'auth-db' `
    -LocalUser $settings['AUTH_DB_USER'] `
    -LocalDatabase $settings['AUTH_DB_NAME'] `
    -DumpPath $authDump
  Update-LocalAuthSchema
  $restoreSucceeded = $true
} finally {
  Invoke-Compose @('exec', '-T', 'emart-db', 'rm', '-f', $emartDump)
  Invoke-Compose @('exec', '-T', 'auth-db', 'rm', '-f', $authDump)

  if ($restoreSucceeded) {
    Write-Host 'Starting the complete E-Mart stack...'
    Invoke-Compose @('up', '-d')
  } else {
    Write-Warning 'Restore failed. Application services remain stopped to protect database consistency.'
  }
}

Write-Host 'Neon data was restored into both local databases successfully.'
Invoke-Compose @('ps')
