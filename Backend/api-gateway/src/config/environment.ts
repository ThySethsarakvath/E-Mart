const required = ['AUTH_SERVICE_URL', 'ORDER_WORKER_URL'] as const;

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missing = required.filter((key) => !asString(config[key]).trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required API Gateway environment variables: ${missing.join(', ')}`,
    );
  }

  return config;
}
