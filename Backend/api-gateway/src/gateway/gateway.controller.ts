/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { All, Controller, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { Public } from '../auth/decorator/public.decorator';

@Controller('api')
export class GatewayController {
  constructor(private proxyService: ProxyService) {}

  @Public()
  @All('auth/*')
  async authRoutes(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Gateway] Received ${req.method} ${req.url}`);
      const startTime = Date.now();

      const path = req.url.replace('/api', '');
      const method = req.method;
      const headers = req.headers;
      const body = req.body;
      const query = req.query;

      const result = await this.proxyService.forwardRequest(
        'auth-service',
        path,
        method,
        headers,
        body,
        query,
      );

      console.log(`[Gateway] Response sent in ${Date.now() - startTime}ms`);
      return res.status(200).json(result);
    } catch (error) {
      console.error(`[Gateway] Error:`, error);
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal server error';
      return res
        .status(status)
        .json({ message, error: error.error || 'Error' });
    }
  }

  @All('products')
  @All('products/*')
  async productRoutes(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Gateway] Received ${req.method} ${req.url}`);
      const startTime = Date.now();

      const path = req.url.replace('/api', '');
      const method = req.method;
      const headers = req.headers;
      const body = req.body;
      const query = req.query;

      const result = await this.proxyService.forwardRequest(
        'order-worker',
        path,
        method,
        headers,
        body,
        query,
      );

      console.log(`[Gateway] Response sent in ${Date.now() - startTime}ms`);
      return res.status(200).json(result);
    } catch (error) {
      console.error(`[Gateway] Error:`, error);
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal server error';
      return res
        .status(status)
        .json({ message, error: error.error || 'Error' });
    }
  }

  @All('arrivals')
  @All('arrivals/*')
  async arrivalRoutes(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Gateway] Received ${req.method} ${req.url}`);
      const path = req.url.replace('/api', '');
      const result = await this.proxyService.forwardRequest(
        'order-worker',
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );
      return res.status(200).json(result);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({ message: error.message || 'Error' });
    }
  }

  @All('banners')
  @All('banners/*')
  async bannerRoutes(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Gateway] Received ${req.method} ${req.url}`);
      const path = req.url.replace('/api', '');
      const result = await this.proxyService.forwardRequest(
        'order-worker',
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );
      return res.status(200).json(result);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({ message: error.message || 'Error' });
    }
  }

  @All('promotions')
  @All('promotions/*')
  async promotionRoutes(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Gateway] Received ${req.method} ${req.url}`);
      const path = req.url.replace('/api', '');
      const result = await this.proxyService.forwardRequest(
        'order-worker',
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );
      return res.status(200).json(result);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({ message: error.message || 'Error' });
    }
  }
}
