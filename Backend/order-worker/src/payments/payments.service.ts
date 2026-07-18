/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Payment } from './entity/payment.entity';
import { CreateQrDto } from './dto/create-qr.dto';
import { OrdersService } from '../orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { Product } from '../products/entities/product.entity';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { formatPayWayRequestTime } from './payway-time';

interface PayWayHttpError {
  isAxiosError: true;
  response?: {
    status?: number;
    data?: {
      status?: {
        code?: string | number;
        message?: string;
        trace_id?: string;
      };
    };
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private http: HttpService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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
    return (
      this.configService.get<string>('PAYWAY_BASE_URL') ||
      this.configService.get<string>('PAYWAY_SANDBOX_URL')
    );
  }

  private generateHash(data: string): string {
    if (!this.apiKey) throw new Error('PAYWAY_API_KEY is not set');
    return crypto
      .createHmac('sha512', this.apiKey)
      .update(data)
      .digest('base64');
  }

  private generateTransactionId(requestTime: string): string {
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return requestTime.slice(2) + random;
  }

  private getRequestTime(): string {
    return formatPayWayRequestTime();
  }

  async createQr(dto: CreateQrDto, user: AuthenticatedUser) {
    const { items, customerInfo } = dto;
    let createdOrderId: number | undefined;
    let paymentPersisted = false;

    try {
      const productIds = [...new Set(items.map((item) => item.productId))];
      const products = await this.productRepository.find({
        where: { id: In(productIds) },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products no longer exist');
      }

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );
      const canonicalItems = items.map((item) => {
        const product = productsById.get(item.productId);
        if (!product) {
          throw new BadRequestException(
            `Product ${item.productId} no longer exists`,
          );
        }

        return {
          productId: product.id,
          productName: product.name,
          price: Number(product.price),
          quantity: item.quantity,
        };
      });

      const order = await this.ordersService.create({
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerEmail: user.email,
        customerPhone: customerInfo.phone,
        items: canonicalItems,
      });
      createdOrderId = order.id;
      const amount = Number(order.total);

      this.logger.log(`Order created: ${order.orderNumber} (ID: ${order.id})`);

      const sandboxUrl = `${this.baseUrl}/payments/generate-qr`;
      const lifetime =
        this.configService.get<number>('PAYWAY_QR_LIFETIME') || 5;
      const callbackUrl =
        this.configService.get<string>('PAYWAY_CALLBACK_URL') || '';
      const reqTime = this.getRequestTime();
      const tranId = this.generateTransactionId(reqTime);
      const amountFormatted = amount.toFixed(2);

      const firstName = customerInfo.firstName;
      const lastName = customerInfo.lastName;
      const email = user.email;
      const phone = customerInfo.phone;

      const itemsJson = JSON.stringify(
        canonicalItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price.toFixed(2),
        })),
      );
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
      paymentPersisted = true;

      // Update order with transaction ID
      await this.ordersService.updatePaymentStatus(order.id, 'PENDING', tranId);

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        transactionId: tranId,
        amount,
        qrString: data.qrString,
        qrImage: data.qrImage,
        deeplink: data.abapay_deeplink,
        expiresIn: lifetime * 60,
      };
    } catch (error) {
      if (createdOrderId && !paymentPersisted) {
        await this.ordersService
          .updateStatus(createdOrderId, 'CANCELLED')
          .catch(() => undefined);
      }
      throw this.toPayWayException(error, 'Payment creation failed');
    }
  }

  async checkTransactionStatus(transactionId: string, user: AuthenticatedUser) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { transactionId },
      });
      this.assertPaymentAccess(payment, user);

      const reqTime = this.getRequestTime();

      const hashString = reqTime + this.merchantId + transactionId;
      const hash = this.generateHash(hashString);

      const payload = {
        req_time: reqTime,
        merchant_id: this.merchantId,
        tran_id: transactionId,
        hash: hash,
      };

      const { data } = await this.http.axiosRef.post(
        `${this.baseUrl}/payments/check-transaction-2`,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      );

      const requestStatus = String(data.status?.code ?? '');
      if (requestStatus !== '00' && requestStatus !== '0') {
        throw new BadRequestException(
          data.status?.message || 'PayWay could not check this transaction',
        );
      }

      const providerStatus = String(
        data.data?.payment_status ?? '',
      ).toUpperCase();
      const providerStatusCode = Number(data.data?.payment_status_code);
      let normalizedStatus: 'SUCCESS' | 'PENDING' | 'FAILED' = 'PENDING';

      if (providerStatusCode === 0 || providerStatus === 'APPROVED') {
        normalizedStatus = 'SUCCESS';
        payment.status = 'SUCCESS';
        payment.paidAt = payment.paidAt || new Date();
        await this.paymentRepository.save(payment);
        await this.ordersService.updatePaymentStatus(
          payment.orderId,
          'PAID',
          transactionId,
        );
      } else if (
        ['DECLINED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(providerStatus)
      ) {
        normalizedStatus = 'FAILED';
        payment.status = providerStatus === 'EXPIRED' ? 'EXPIRED' : 'FAILED';
        await this.paymentRepository.save(payment);
        await this.ordersService.updatePaymentStatus(payment.orderId, 'FAILED');
      }

      return {
        success: true,
        transactionId,
        status: normalizedStatus,
        providerStatus: data.data?.payment_status,
        statusMessage: data.status?.message,
        amount: data.data?.payment_amount,
      };
    } catch (error) {
      throw this.toPayWayException(error, 'Failed to check transaction');
    }
  }

  async handleCallback(
    callbackData: {
      tran_id: string;
      apv: number | string;
      status: string;
      merchant_ref_no?: string;
    },
    signature?: string,
  ) {
    try {
      this.verifyCallbackSignature(callbackData, signature);
      this.logger.log(`Received callback for tran_id: ${callbackData.tran_id}`);
      return await this.applyCallbackStatus(callbackData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Callback handling failed: ${message}`, stack);
      throw error;
    }
  }

  async getPaymentByOrderId(orderId: number, user: AuthenticatedUser) {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
    this.assertPaymentAccess(payment, user);
    return payment;
  }

  async getPaymentByTransactionId(
    transactionId: string,
    user: AuthenticatedUser,
  ) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
    });
    this.assertPaymentAccess(payment, user);
    return payment;
  }

  async simulatePayment(transactionId: string, user: AuthenticatedUser) {
    const simulationEnabled =
      this.configService.get<string>('PAYWAY_ENABLE_SIMULATION', 'false') ===
      'true';

    if (
      this.configService.get('NODE_ENV') === 'production' ||
      !simulationEnabled
    ) {
      throw new ForbiddenException('Payment simulation is disabled');
    }

    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
    });
    this.assertPaymentAccess(payment, user);

    return this.applyCallbackStatus({
      tran_id: transactionId,
      apv: Math.floor(Math.random() * 1000000),
      status: '00',
      merchant_ref_no: transactionId,
    });
  }

  private verifyCallbackSignature(
    callbackData: object,
    signature?: string,
  ): void {
    const verify =
      this.configService.get<string>(
        'PAYWAY_VERIFY_CALLBACK',
        this.configService.get('NODE_ENV') === 'production' ? 'true' : 'false',
      ) === 'true';

    if (!verify) return;
    if (!signature) {
      throw new ForbiddenException('Missing PayWay callback signature');
    }

    const data = callbackData as Record<string, unknown>;
    const source = Object.keys(data)
      .sort()
      .map((key) => {
        const value = data[key];
        if (value == null) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          typeof value === 'bigint'
        ) {
          return `${value}`;
        }
        return '';
      })
      .join('');
    const expected = this.generateHash(source);
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new ForbiddenException('Invalid PayWay callback signature');
    }
  }

  private assertPaymentAccess(
    payment: Payment | null,
    user: AuthenticatedUser,
  ): asserts payment is Payment {
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (
      payment.customerEmail !== user.email &&
      !user.roles?.includes('admin')
    ) {
      throw new ForbiddenException('You cannot access this payment');
    }
  }

  private toPayWayException(error: unknown, context: string): Error {
    if (!this.isPayWayHttpError(error)) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`${context}: ${message}`);
      return error instanceof Error ? error : new Error(message);
    }

    const response = error.response?.data;
    const providerCode = response?.status?.code;
    const rawProviderMessage =
      response?.status?.message || 'PayWay request was rejected';
    const providerMessage =
      String(providerCode) === '21'
        ? 'PayWay merchant API access has expired. Renew the PayWay credentials.'
        : rawProviderMessage;
    const traceId = response?.status?.trace_id;
    const httpStatus = error.response?.status;

    this.logger.error(
      `${context}: HTTP ${httpStatus ?? 'unknown'}, PayWay code ${
        providerCode ?? 'unknown'
      }, ${rawProviderMessage}${traceId ? `, trace ${traceId}` : ''}`,
    );

    return new BadGatewayException({
      message: providerMessage,
      providerCode,
      traceId,
    });
  }

  private isPayWayHttpError(error: unknown): error is PayWayHttpError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      error.isAxiosError === true
    );
  }

  private async applyCallbackStatus(callbackData: {
    tran_id: string;
    apv: number | string;
    status: string;
    merchant_ref_no?: string;
  }) {
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
      payment.approvalCode = String(callbackData.apv);
      payment.paidAt = payment.paidAt || new Date();
      await this.paymentRepository.save(payment);
      await this.ordersService.updatePaymentStatus(
        payment.orderId,
        'PAID',
        callbackData.tran_id,
      );
    } else {
      payment.status = 'FAILED';
      await this.paymentRepository.save(payment);
      await this.ordersService.updatePaymentStatus(payment.orderId, 'FAILED');
    }

    return {
      success: true,
      transactionId: callbackData.tran_id,
      status: payment.status,
    };
  }
}
