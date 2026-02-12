import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createIntent(@Body() data: { amount: number }) {
    const intent = await this.paymentsService.createPaymentIntent(data.amount);
    return {
      clientSecret: intent.client_secret,
    };
  }
}