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
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import {
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/update-order-status.dto';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/authenticated-user';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Req() req: AuthenticatedRequest) {
    if (!req.user.email) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userEmail = req.user.email;
    return this.ordersService.findByEmail(userEmail);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getDashboardStats() {
    return await this.ordersService.getDashboardStats();
  }

  @Get('stats/summary')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getStatistics() {
    return this.ordersService.getStatistics();
  }

  @Get('number/:orderNumber')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findByUserId(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ordersService.findByUserId(+userId, pageNum, limitNum);
  }

  @Get('email/:email')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findByEmail(@Param('email') email: string) {
    return this.ordersService.findByEmail(email);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.create({
      ...createOrderDto,
      customerEmail: req.user.email,
    });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ordersService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(+id, body.status);
  }

  @Patch(':id/payment-status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: UpdatePaymentStatusDto,
  ) {
    return this.ordersService.updatePaymentStatus(
      +id,
      body.paymentStatus,
      body.transactionId,
    );
  }

  @Post(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('admin')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(+id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
