/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyService {
  private readonly ORDER_WORKER_URL: string;
  private readonly AUTH_SERVICE_URL: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.ORDER_WORKER_URL =
      this.configService.get('ORDER_WORKER_URL') || 'http://order-worker:3000';
    this.AUTH_SERVICE_URL =
      this.configService.get('AUTH_SERVICE_URL') || 'http://auth-service:3000';
  }

  async forwardRequest(
    service: 'order-worker' | 'auth-service',
    path: string,
    method: string,
    headers: any,
    body?: any,
    query?: any,
  ) {
    const baseUrl =
      service === 'order-worker'
        ? this.ORDER_WORKER_URL
        : this.AUTH_SERVICE_URL;
    const url = `${baseUrl}${path}`;

    const config: any = {
      method,
      url,
      headers: {
        ...headers,
        host: undefined,
      },
      params: query,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true,
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = body;
    }

    try {
      console.log(`[ProxyService] Forwarding ${method} ${url}`);
      const startTime = Date.now();

      const response = await firstValueFrom(this.httpService.request(config));

      console.log(
        `[ProxyService] Response received in ${Date.now() - startTime}ms (Status: ${response.status})`,
      );
      return response.data;
    } catch (error) {
      console.error(`[ProxyService] Error forwarding request:`, error.message);
      throw error.response?.data || error.message;
    }
  }
}
