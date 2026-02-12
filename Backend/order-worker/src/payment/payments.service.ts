import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as any, // Use the latest API version
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    // Stripe expects amount in cents (e.g., $10.00 = 1000)
    const amountInCents = Math.round(amount * 100);

    return await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }
}