/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { All, Controller, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { Public } from '../auth/decorator/public.decorator';

@Controller('api')
export class GatewayController {
  constructor(private proxyService: ProxyService) {}

  @Public()
  @All('*')
  async handleRequest(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    try {
      const path = req.url.replace('/api', '');
      console.log(`[Proxy] ${req.method} ${req.url} -> ${path}`);

      // Determine which service to route to based on path
      let service: 'auth-service' | 'order-worker';

      if (path.startsWith('/auth')) {
        service = 'auth-service';
      } else if (
        path.startsWith('/products') ||
        path.startsWith('/banners') ||
        path.startsWith('/arrivals') ||
        path.startsWith('/promotions') ||
        path.startsWith('/orders')
      ) {
        service = 'order-worker';
      } else {
        return res.status(404).json({
          message: 'Service not found',
          path: path,
        });
      }

      // Check if multipart
      const isMultipart = req.headers['content-type']?.includes(
        'multipart/form-data',
      );

      const result = await this.proxyService.forwardRequest(
        service,
        path,
        req.method,
        req.headers,
        isMultipart ? null : req.body,
        req.query,
        isMultipart ? req : undefined,
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error(`[Proxy] Error:`, error);
      const isError = error instanceof Error;
      const status = (error as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        message: isError ? error.message : 'Error',
        details: (error as any).error,
      });
    }
  }
}
