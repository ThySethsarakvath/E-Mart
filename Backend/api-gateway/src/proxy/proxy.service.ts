/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  private readonly ORDER_WORKER_URL: string;
  private readonly AUTH_SERVICE_URL: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.ORDER_WORKER_URL =
      this.configService.get('ORDER_WORKER_URL') ||
      'http://e-mart-order-worker-1:3000';
    this.AUTH_SERVICE_URL =
      this.configService.get('AUTH_SERVICE_URL') ||
      'http://e-mart-auth-service-1:3000';
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

    const cleanHeaders = { ...headers };
    delete cleanHeaders['host'];
    delete cleanHeaders['connection'];
    delete cleanHeaders['content-length'];

    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: cleanHeaders,
      params: query,
      timeout: 10000,
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = body;
    }

    try {
      console.log(`[ProxyService] Forwarding ${method} ${url}`);
      console.log(`[ProxyService] Headers:`, cleanHeaders); // Debug log
      const startTime = Date.now();

      const response = await firstValueFrom(this.httpService.request(config));

      console.log(
        `[ProxyService] Response received in ${Date.now() - startTime}ms (Status: ${response.status})`,
      );
      return response.data;
    } catch (error) {
      console.error(`[ProxyService] Error:`, error.message);
      console.error(
        `[ProxyService] Error details:`,
        error.response?.data || error,
      );
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message,
        error: error.response?.data || 'Internal server error',
      };
    }
  }
}
