import { validateEnvironment } from './environment';

const validConfig = {
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  JWT_ACCESS_EXPIRES: '15m',
  JWT_REFRESH_EXPIRES: '7d',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'auth',
  DB_PASS: 'auth',
  DB_NAME: 'auth_db',
};

describe('validateEnvironment', () => {
  it('accepts individual local database settings', () => {
    expect(validateEnvironment(validConfig)).toBe(validConfig);
  });

  it('accepts a hosted database URL', () => {
    const config = {
      ...validConfig,
      DB_HOST: '',
      DATABASE_AUTH_URL: 'postgresql://example',
    };
    expect(validateEnvironment(config)).toBe(config);
  });
});
