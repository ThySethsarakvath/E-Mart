import { validateEnvironment } from './environment';

const validConfig = {
  JWT_ACCESS_SECRET: 'access-secret',
  CLOUDINARY_CLOUD_NAME: 'cloud',
  CLOUDINARY_API_KEY: 'key',
  CLOUDINARY_API_SECRET: 'secret',
  PAYWAY_MERCHANT_ID: 'merchant',
  PAYWAY_API_KEY: 'payway-key',
  PAYWAY_BASE_URL:
    'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'postgres',
  DB_PASS: 'postgres',
  DB_NAME: 'e_mart',
};

describe('validateEnvironment', () => {
  it('accepts complete local configuration', () => {
    expect(validateEnvironment(validConfig)).toBe(validConfig);
  });

  it('rejects incomplete payment configuration', () => {
    expect(() =>
      validateEnvironment({ ...validConfig, PAYWAY_API_KEY: '' }),
    ).toThrow('PAYWAY_API_KEY');
  });
});
