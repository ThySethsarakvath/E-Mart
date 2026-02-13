/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin') // Only admins can access these routes
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  // This will handle GET /api/users
  @Get()
  async findAll() {
    // We will add this method to AuthService next
    return this.authService.findAllUsers();
  }

  // This will handle GET /api/users/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.authService.getProfile(id);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.authService.toggleUserStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }
}
