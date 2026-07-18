/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import * as bodyParser from 'body-parser';

const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({ extended: true });

@Controller('api')
export class GatewayController {
  constructor(private proxyService: ProxyService) {}

  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api', '');
      console.log(`[Proxy] ${req.method} ${req.url} -> ${path}`);

      let service: 'auth-service' | 'order-worker';

      if (path.startsWith('/auth') || path.startsWith('/users')) {
        service = 'auth-service';
      } else if (
        path.startsWith('/products') ||
        path.startsWith('/banners') ||
        path.startsWith('/arrivals') ||
        path.startsWith('/promotions') ||
        path.startsWith('/orders') ||
        path.startsWith('/categories') ||
        path.startsWith('/payments')
      ) {
        service = 'order-worker';
      } else {
        return res.status(404).json({ message: 'Service not found' });
      }

      const isMultipart = req.headers['content-type']?.includes(
        'multipart/form-data',
      );

      // ✅ Parse body only when NOT multipart
      if (!isMultipart && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        await new Promise((resolve, reject) => {
          jsonParser(req, res, (err) => (err ? reject(err) : resolve(null)));
        });

        await new Promise((resolve, reject) => {
          urlEncodedParser(req, res, (err) =>
            err ? reject(err) : resolve(null),
          );
        });
      }

      const result = await this.proxyService.forwardRequest(
        service,
        path,
        req.method,
        req.headers,
        isMultipart ? undefined : (req as any).body,
        req.query,
        isMultipart ? req : undefined,
      );

      return res.status(result.status).json(result.data);
    } catch (error: unknown) {
      console.error('[Proxy] Error:', error);
      const proxyError = error as {
        status?: unknown;
        message?: unknown;
        error?: unknown;
      };
      const status =
        typeof proxyError.status === 'number' ? proxyError.status : 500;
      const message =
        typeof proxyError.message === 'string'
          ? proxyError.message
          : 'Proxy error';

      return res.status(status).json({
        message,
        details: proxyError.error,
      });
    }
  }
}
