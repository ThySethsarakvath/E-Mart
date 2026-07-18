const required = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES',
  'JWT_REFRESH_EXPIRES',
] as const;

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }
  return '';
}

function hasDatabaseConfiguration(config: Record<string, unknown>): boolean {
  if (asString(config.DATABASE_AUTH_URL).trim()) return true;

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

  if (!hasDatabaseConfiguration(config)) {
    missing.push(
      'DATABASE_AUTH_URL or DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME',
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Auth Service environment variables: ${missing.join(', ')}`,
    );
  }

  if (
    config.NODE_ENV === 'production' &&
    (asString(config.JWT_ACCESS_SECRET).length < 32 ||
      asString(config.JWT_REFRESH_SECRET).length < 32)
  ) {
    throw new Error('Production JWT secrets must be at least 32 characters');
  }

  return config;
}
