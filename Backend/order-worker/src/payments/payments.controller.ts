import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateQrDto } from './dto/create-qr.dto';
import { Public } from '../auth/decorator/public.decorator';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/authenticated-user';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-qr')
  async createQr(
    @Body() createQrDto: CreateQrDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.createQr(createQrDto, req.user);
  }

  @Public()
  @Post('callback')
  @HttpCode(200)
  async handleCallback(
    @Body()
    callbackData: {
      tran_id: string;
      apv: number | string;
      status: string;
      merchant_ref_no?: string;
    },
    @Headers('x-payway-hmac-sha512') signature?: string,
  ) {
    return this.paymentsService.handleCallback(callbackData, signature);
  }

  @Post('check-status')
  async checkStatus(
    @Body() body: { transactionId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.checkTransactionStatus(
      body.transactionId,
      req.user,
    );
  }

  @Get('order/:orderId')
  async getPaymentByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.getPaymentByOrderId(orderId, req.user);
  }

  @Get('transaction/:transactionId')
  async getPaymentByTransactionId(
    @Param('transactionId') transactionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.getPaymentByTransactionId(
      transactionId,
      req.user,
    );
  }

  @Post('test/simulate-payment')
  async simulatePayment(
    @Body() body: { transactionId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.simulatePayment(body.transactionId, req.user);
  }
}
