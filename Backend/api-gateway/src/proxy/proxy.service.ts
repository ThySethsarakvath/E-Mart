/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import type { Request } from 'express';

export interface ProxyResponse {
  status: number;
  data: unknown;
  headers: Record<string, unknown>;
}

@Injectable()
export class ProxyService {
  private readonly ORDER_WORKER_URL: string;
  private readonly AUTH_SERVICE_URL: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.ORDER_WORKER_URL = this.configService.get<string>(
      'ORDER_WORKER_URL',
      '',
    );
    this.AUTH_SERVICE_URL = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      '',
    );
  }

  async forwardRequest(
    service: 'order-worker' | 'auth-service',
    path: string,
    method: string,
    headers: any,
    body?: any,
    query?: any,
    rawRequest?: Request,
  ): Promise<ProxyResponse> {
    const baseUrl =
      service === 'order-worker'
        ? this.ORDER_WORKER_URL
        : this.AUTH_SERVICE_URL;

    const url = `${baseUrl}${path}`;
    const cleanHeaders = { ...headers };

    delete cleanHeaders.host;
    delete cleanHeaders.connection;
    delete cleanHeaders['content-length'];

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
    if (isMultipart && rawRequest) {
      // stream raw request for file uploads
      config.data = rawRequest;
    } else if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = body;
    }

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return {
        status: response.status,
        data: response.data,
        headers: response.headers as Record<string, unknown>,
      };
    } catch (err: any) {
      console.error('PROXY ERROR FULL:', err.response?.data || err.message);

      throw {
        status: err.response?.status || 500,
        message: err.response?.data?.message || err.message,
        error: err.response?.data,
      };
    }
  }
}
