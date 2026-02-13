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

  /**
   * Create QR code for payment
   * POST /api/payments/create-qr
   */
  @Post('create-qr')
  async createQr(@Body() createQrDto: CreateQrDto) {
    // We pass the whole DTO to the service now
    return this.paymentsService.createQr(createQrDto);
  }

  /**
   * Webhook endpoint for ABA Payway payment callbacks
   * POST /api/payments/callback
   */
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

  /**
   * Check transaction status
   * POST /api/payments/check-status
   */
  @Post('check-status')
  async checkStatus(@Body() body: { transactionId: string }) {
    return this.paymentsService.checkTransactionStatus(body.transactionId);
  }

  /**
   * Get payment by order ID
   * GET /api/payments/order/:orderId
   */
  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: number) {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }

  /**
   * Get payment by transaction ID
   * GET /api/payments/transaction/:transactionId
   */
  @Get('transaction/:transactionId')
  async getPaymentByTransactionId(
    @Param('transactionId') transactionId: string,
  ) {
    return this.paymentsService.getPaymentByTransactionId(transactionId);
  }

  // ============================================
  // SANDBOX TESTING ENDPOINTS (Remove in production)
  // ============================================

  /**
   * Simulate payment success for testing
   * POST /api/payments/test/simulate-payment
   */
  @Post('test/simulate-payment')
  async simulatePayment(@Body() body: { transactionId: string }) {
    return this.paymentsService.fakeCallback(body.transactionId);
  }
}
