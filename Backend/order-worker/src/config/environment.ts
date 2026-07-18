const required = [
  'JWT_ACCESS_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'PAYWAY_MERCHANT_ID',
  'PAYWAY_API_KEY',
] as const;

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }
  return '';
}

function hasDatabaseConfiguration(config: Record<string, unknown>): boolean {
  if (asString(config.DATABASE_EMART_URL).trim()) return true;

  return ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME'].every((key) =>
    asString(config[key]).trim(),
  );
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missing: string[] = required.filter(
    (key) => !asString(config[key]).trim(),
  );

  if (
    !asString(config.PAYWAY_BASE_URL).trim() &&
    !asString(config.PAYWAY_SANDBOX_URL).trim()
  ) {
    missing.push('PAYWAY_BASE_URL');
  }

  if (!hasDatabaseConfiguration(config)) {
    missing.push(
      'DATABASE_EMART_URL or DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME',
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Order Worker environment variables: ${missing.join(', ')}`,
    );
  }

  return config;
}
