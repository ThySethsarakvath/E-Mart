/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateQrDto } from './dto/create-qr.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-qr')
  async createQr(@Body() createQrDto: CreateQrDto) {
    // We pass the whole DTO to the service now
    return this.paymentsService.createQr(createQrDto);
  }

  @Post('callback')
  @HttpCode(200)
  async handleCallback(
    @Body()
    callbackData: {
      tran_id: string;
      apv: number;
      status: string;
      merchant_ref_no: string;
    },
  ) {
    return this.paymentsService.handleCallback(callbackData);
  }

  @Post('check-status')
  async checkStatus(@Body() body: { transactionId: string }) {
    return this.paymentsService.checkTransactionStatus(body.transactionId);
  }

  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: number) {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }

  @Get('transaction/:transactionId')
  async getPaymentByTransactionId(
    @Param('transactionId') transactionId: string,
  ) {
    return this.paymentsService.getPaymentByTransactionId(transactionId);
  }

  @Post('test/simulate-payment')
  async simulatePayment(@Body() body: { transactionId: string }) {
    return this.paymentsService.fakeCallback(body.transactionId);
  }
}
