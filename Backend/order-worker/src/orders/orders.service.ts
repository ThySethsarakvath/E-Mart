/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  /**
   * Generate unique order number
   * Format: ORD-YYYYMMDD-XXXXXX
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `ORD-${dateStr}-${random}`;
  }

  /**
   * Create a new order
   */
  async create(createOrderDto: CreateOrderDto) {
    try {
      // Calculate totals
      const subtotal = createOrderDto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      // Create order
      const order = this.orderRepository.create({
        orderNumber: this.generateOrderNumber(),
        userId: createOrderDto.userId,
        customerFirstName: createOrderDto.customerFirstName,
        customerLastName: createOrderDto.customerLastName,
        customerEmail: createOrderDto.customerEmail,
        customerPhone: createOrderDto.customerPhone,
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        notes: createOrderDto.notes,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Create order items
      const orderItems = createOrderDto.items.map((item) => {
        return this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        });
      });

      await this.orderItemRepository.save(orderItems);

      // Return order with items
      return this.findOne(savedOrder.id);
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all orders (with pagination)
   */
  async findAll(page = 1, limit = 10) {
    const [orders, total] = await this.orderRepository.findAndCount({
      relations: ['items', 'payment'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one order by ID
   */
  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'payment'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'payment'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  /**
   * Find orders by user ID
   */
  async findByUserId(userId: number, page = 1, limit = 10) {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      relations: ['items', 'payment'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find orders by email
   */
  async findByEmail(email: string) {
    return await this.orderRepository.find({
      where: { customerEmail: email },
      relations: ['items', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update order status
   */
  async updateStatus(id: number, status: string) {
    const order = await this.findOne(id);
    order.status = status;
    return await this.orderRepository.save(order);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: number,
    paymentStatus: string,
    transactionId?: string,
  ) {
    const order = await this.findOne(id);
    order.paymentStatus = paymentStatus;

    if (transactionId) {
      order.transactionId = transactionId;
    }

    if (paymentStatus === 'PAID') {
      order.status = 'PROCESSING';
      order.paymentMethod = 'ABA_KHQR';
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Update order by transaction ID
   */
  async updateByTransactionId(transactionId: string, paymentStatus: string) {
    const order = await this.orderRepository.findOne({
      where: { transactionId },
      relations: ['items'],
    });

    if (!order) {
      this.logger.warn(`Order with transaction ${transactionId} not found`);
      return null;
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === 'PAID') {
      order.status = 'PROCESSING';
      order.paymentMethod = 'ABA_KHQR';
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Cancel order
   */
  async cancel(id: number) {
    const order = await this.findOne(id);

    if (order.paymentStatus === 'PAID') {
      throw new Error('Cannot cancel a paid order. Please request a refund.');
    }

    order.status = 'CANCELLED';
    return await this.orderRepository.save(order);
  }

  /**
   * Delete order (soft delete)
   */
  async remove(id: number) {
    const order = await this.findOne(id);
    return await this.orderRepository.remove(order);
  }

  /**
   * Get order statistics
   */
  async getStatistics() {
    const totalOrders = await this.orderRepository.count();
    const paidOrders = await this.orderRepository.count({
      where: { paymentStatus: 'PAID' },
    });
    const pendingOrders = await this.orderRepository.count({
      where: { paymentStatus: 'PENDING' },
    });

    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.paymentStatus = :status', { status: 'PAID' })
      .getRawOne();

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
    };
  }
}
