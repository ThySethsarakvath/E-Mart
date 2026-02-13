/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
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
import type { Request } from 'express';

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
      'http://order-worker:3000';

    this.AUTH_SERVICE_URL =
      this.configService.get('AUTH_SERVICE_URL') ||
      'http://auth-service:3000';
  }

  async forwardRequest(
    service: 'order-worker' | 'auth-service' | 'payments',
    path: string,
    method: string,
    headers: any,
    body?: any,
    query?: any,
    rawRequest?: Request,
  ) {
    const baseUrl =
    (service === 'order-worker' || service === 'payments')
      service === 'order-worker'
        ? this.ORDER_WORKER_URL
        : this.AUTH_SERVICE_URL;

    const url = `${baseUrl}${path}`;

    // ===========================
    // CLEAN HOP-BY-HOP HEADERS
    // ===========================
    const cleanHeaders = { ...headers };

    delete cleanHeaders.host;
    delete cleanHeaders.connection;
    delete cleanHeaders['content-length']; // critical for multipart

    const isMultipart = headers['content-type']?.includes(
      'multipart/form-data',
    );

    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: cleanHeaders,
      params: query,
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    };

    // ===========================
    // BODY HANDLING
    // ===========================
    if (isMultipart && rawRequest) {
      // stream raw request for file uploads
      config.data = rawRequest;
    } else if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = body;
    }

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return response.data;
    } catch (err: any) {
      console.error('PROXY ERROR FULL:', err.response?.data || err.message);

      throw {
        status: err.response?.status || 500,
        message: err.response?.data || err.message,
        error: err.response?.data,
      };
    }
  }
}
