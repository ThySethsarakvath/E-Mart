import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('AUTH_DB_HOST'),
        port: cfg.get('AUTH_DB_PORT'),
        username: cfg.get('AUTH_DB_USER'),
        password: cfg.get('AUTH_DB_PASS'),
        database: cfg.get('AUTH_DB_NAME'),
        entities: [
          User,
          Role,
          Permission,
          UserRole,
          RolePermission,
          RefreshToken,
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
