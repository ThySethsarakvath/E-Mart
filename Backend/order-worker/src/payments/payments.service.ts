/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Payment } from './entity/payment.entity';
import * as qs from 'qs';
import { CreateQrDto } from './dto/create-qr.dto';
import { OrdersService } from '../orders/orders.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private http: HttpService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {}

  private get merchantId() {
    return this.configService.get<string>('PAYWAY_MERCHANT_ID');
  }
  private get apiKey() {
    return this.configService.get<string>('PAYWAY_API_KEY');
  }
  private get baseUrl() {
    return this.configService.get<string>('PAYWAY_SANDBOX_URL');
  }

  private generateHash(data: string): string {
    if (!this.apiKey) throw new Error('PAYWAY_API_KEY is not set');
    return crypto
      .createHmac('sha512', this.apiKey)
      .update(data)
      .digest('base64');
  }

  private generateTransactionId(): string {
    const now = new Date();
    const timestamp =
      now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return timestamp + random;
  }

  async createQr(dto: CreateQrDto) {
    const { orderId, amount, items, customerInfo } = dto;

    try {
      // First, create the order in the database
      const order = await this.ordersService.create({
        customerFirstName: customerInfo?.firstName || 'Customer',
        customerLastName: customerInfo?.lastName || 'Guest',
        customerEmail: customerInfo?.email || 'customer@test.com',
        customerPhone: customerInfo?.phone || '012345678',
        items: items?.map((item) => ({
          productId: item.id || 0,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
        })) || [
          {
            productId: 0,
            productName: `Order ${orderId}`,
            price: amount,
            quantity: 1,
          },
        ],
      });

      this.logger.log(`Order created: ${order.orderNumber} (ID: ${order.id})`);

      const sandboxUrl = `${this.baseUrl}/payments/generate-qr`;
      const lifetime =
        this.configService.get<number>('PAYWAY_QR_LIFETIME') || 5;
      const callbackUrl =
        this.configService.get<string>('PAYWAY_CALLBACK_URL') || '';
      const tranId = this.generateTransactionId();
      const reqTime = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14);
      const amountFormatted = amount.toFixed(2);

      const firstName = customerInfo?.firstName || 'Customer';
      const lastName = customerInfo?.lastName || 'Guest';
      const email = customerInfo?.email || 'customer@test.com';
      const phone = customerInfo?.phone || '012345678';

      const itemsJson = JSON.stringify([
        {
          name: `Order ${order.orderNumber}`,
          quantity: 1,
          price: amountFormatted,
        },
      ]);
      const itemsBase64 = Buffer.from(itemsJson).toString('base64');
      const callbackBase64 = Buffer.from(callbackUrl).toString('base64');

      const returnDeeplink = '';
      const customFields = '';
      const returnParams = '';
      const payout = '';
      const qrTemplate = 'template3_color';
      const currency = 'USD';
      const purchaseType = 'purchase';
      const paymentOption = 'abapay_khqr';

      const hashString =
        reqTime +
        this.merchantId +
        tranId +
        amountFormatted +
        itemsBase64 +
        firstName +
        lastName +
        email +
        phone +
        purchaseType +
        paymentOption +
        callbackBase64 +
        returnDeeplink +
        currency +
        customFields +
        returnParams +
        payout +
        lifetime +
        qrTemplate;

      const hash = this.generateHash(hashString);

      const payload = {
        req_time: reqTime,
        merchant_id: this.merchantId,
        tran_id: tranId,
        amount: amountFormatted,
        items: itemsBase64,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        purchase_type: purchaseType,
        payment_option: paymentOption,
        callback_url: callbackBase64,
        return_deeplink: returnDeeplink,
        currency: currency,
        custom_fields: customFields,
        return_params: returnParams,
        payout: payout,
        lifetime: lifetime,
        qr_image_template: qrTemplate,
        hash: hash,
      };

      const response = await this.http.axiosRef.post(sandboxUrl, payload);
      const data = response.data;
      const statusCode =
        typeof data.status === 'object' ? data.status.code : data.status;

      if (statusCode != '0' && statusCode != 0) {
        throw new Error(`ABA Error: Status ${statusCode}`);
      }

      const payment = this.paymentRepository.create({
        orderId: order.id,
        transactionId: tranId,
        amount,
        currency: 'USD',
        status: 'PENDING',
        qrString: data.qrString,
        paymentMethod: 'ABA_KHQR',
        customerEmail: email,
        customerPhone: phone,
      });

      await this.paymentRepository.save(payment);

      // Update order with transaction ID
      await this.ordersService.updatePaymentStatus(order.id, 'PENDING', tranId);

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        transactionId: tranId,
        qrString: data.qrString,
        qrImage: data.qrImage,
        deeplink: data.abapay_deeplink,
        expiresIn: lifetime * 60,
      };
    } catch (error) {
      this.logger.error('System Error:', error.message);
      throw error;
    }
  }

  async checkTransactionStatus(transactionId: string) {
    try {
      const reqTime = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .substring(0, 14);

      const hashString = reqTime + this.merchantId + transactionId;
      const hash = this.generateHash(hashString);

      const payload = {
        req_time: reqTime,
        merchant_id: this.merchantId,
        tran_id: transactionId,
        hash: hash,
      };

      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/payments/check-transaction`,
        qs.stringify(payload),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const payment = await this.paymentRepository.findOne({
        where: { transactionId },
      });

      if (payment) {
        const status = String(data.status);

        if (status === '00' || status === '0') {
          payment.status = 'SUCCESS';
          payment.paidAt = new Date();
          await this.paymentRepository.save(payment);

          // Update order status
          if (payment.orderId) {
            await this.ordersService.updatePaymentStatus(
              payment.orderId,
              'PAID',
              transactionId,
            );
          }
        } else if (
          status === '11' ||
          status === '2' ||
          status === 'null' ||
          !status
        ) {
          // Treat 'null' or empty status as PENDING in sandbox
          payment.status = 'PENDING';
        } else {
          // ONLY fail if it's a real failure code (like 1 = Invalid Hash, etc.)
          payment.status = 'FAILED';
          if (payment.orderId) {
            await this.ordersService.updatePaymentStatus(
              payment.orderId,
              'FAILED',
            );
          }
        }
      }

      return {
        success: true,
        transactionId,
        status: data.status,
        statusMessage: data.description || data.message,
        amount: data.amount,
      };
    } catch (error) {
      this.logger.error(`Failed to check transaction: ${error.message}`);
      throw error;
    }
  }

  async handleCallback(callbackData: {
    tran_id: string;
    apv: number;
    status: string;
    merchant_ref_no: string;
  }) {
    try {
      this.logger.log(`Received callback for tran_id: ${callbackData.tran_id}`);

      const payment = await this.paymentRepository.findOne({
        where: { transactionId: callbackData.tran_id },
      });

      if (!payment) {
        this.logger.warn(
          `Payment not found for tran_id: ${callbackData.tran_id}`,
        );
        return { success: false, message: 'Payment not found' };
      }

      if (callbackData.status === '00' || callbackData.status === '0') {
        payment.status = 'SUCCESS';
        payment.approvalCode = callbackData.apv.toString();
        payment.paidAt = new Date();
        await this.paymentRepository.save(payment);

        // Update order
        if (payment.orderId) {
          await this.ordersService.updatePaymentStatus(
            payment.orderId,
            'PAID',
            callbackData.tran_id,
          );
        }
      } else {
        payment.status = 'FAILED';
        await this.paymentRepository.save(payment);

        if (payment.orderId) {
          await this.ordersService.updatePaymentStatus(
            payment.orderId,
            'FAILED',
          );
        }
      }

      this.logger.log(
        `Payment ${callbackData.tran_id} updated to ${payment.status}`,
      );

      return {
        success: true,
        transactionId: callbackData.tran_id,
        status: payment.status,
      };
    } catch (error) {
      this.logger.error(
        `Callback handling failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPaymentByOrderId(orderId: number) {
    return await this.paymentRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentByTransactionId(transactionId: string) {
    return await this.paymentRepository.findOne({
      where: { transactionId },
    });
  }

  async fakeCallback(transactionId: string) {
    return this.handleCallback({
      tran_id: transactionId,
      apv: Math.floor(Math.random() * 1000000),
      status: '00',
      merchant_ref_no: transactionId,
    });
  }
}
