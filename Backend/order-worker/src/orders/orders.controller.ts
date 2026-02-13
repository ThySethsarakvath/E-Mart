/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // order.controller.ts (in your order-worker service)
  @Get('my-orders')
  @UseGuards(JwtAuthGuard) // This guard should extract req.user.id from the token
  async getMyOrders(@Req() req) {
    console.log('User from Token:', req.user);
    const userId = req.user.id; // Or req.user.sub depending on your strategy
    return this.ordersService.findByUserId(userId);
  }

  /**
   * Create a new order
   * POST /api/orders
   */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  /**
   * Get all orders with pagination
   * GET /api/orders?page=1&limit=10
   */
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ordersService.findAll(pageNum, limitNum);
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  /**
   * Get order by order number
   * GET /api/orders/number/:orderNumber
   */
  @Get('number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  /**
   * Get orders by user ID
   * GET /api/orders/user/:userId
   */
  @Get('user/:userId')
  findByUserId(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ordersService.findByUserId(+userId, pageNum, limitNum);
  }

  /**
   * Get orders by email
   * GET /api/orders/email/:email
   */
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.ordersService.findByEmail(email);
  }

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateStatus(+id, body.status);
  }

  /**
   * Update payment status
   * PATCH /api/orders/:id/payment-status
   */
  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: string; transactionId?: string },
  ) {
    return this.ordersService.updatePaymentStatus(
      +id,
      body.paymentStatus,
      body.transactionId,
    );
  }

  /**
   * Cancel order
   * POST /api/orders/:id/cancel
   */
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(+id);
  }

  /**
   * Delete order
   * DELETE /api/orders/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  /**
   * Get order statistics
   * GET /api/orders/stats/summary
   */
  @Get('stats/summary')
  getStatistics() {
    return this.ordersService.getStatistics();
  }
}
