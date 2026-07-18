import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('returns the service identity', () => {
      expect(appController.getHello()).toBe(
        'Hello From Api Gateway Service!!!',
      );
    });

    it('reports a healthy service', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
        service: 'api-gateway',
      });
    });
  });
});
