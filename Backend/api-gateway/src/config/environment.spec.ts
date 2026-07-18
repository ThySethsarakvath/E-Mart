import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  it('accepts complete gateway configuration', () => {
    const config = {
      AUTH_SERVICE_URL: 'http://auth-service:3000',
      ORDER_WORKER_URL: 'http://order-worker:3000',
    };
    expect(validateEnvironment(config)).toBe(config);
  });

  it('rejects missing service URLs', () => {
    expect(() => validateEnvironment({})).toThrow(
      'AUTH_SERVICE_URL, ORDER_WORKER_URL',
    );
  });
});
