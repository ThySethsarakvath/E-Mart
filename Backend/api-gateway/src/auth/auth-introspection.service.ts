/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthIntrospectionService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async validateToken(token: string): Promise<any> {
    try {
      const authServiceUrl =
        this.configService.get('AUTH_SERVICE_URL') ||
        'http://auth-service:3000';

      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      return null;
    }
  }
}
