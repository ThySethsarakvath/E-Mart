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
      useFactory: (cfg: ConfigService) => {
        const dbUrl = cfg.get<string>('DATABASE_AUTH_URL');
        const useSsl = cfg.get<string>('DB_SSL', 'false') === 'true';
        const synchronize =
          cfg.get<string>(
            'DB_SYNCHRONIZE',
            cfg.get('NODE_ENV') === 'production' ? 'false' : 'true',
          ) === 'true';

        return {
          type: 'postgres' as const,
          ...(dbUrl
            ? { url: dbUrl }
            : {
                host: cfg.get<string>('DB_HOST'),
                port: cfg.get<number>('DB_PORT'),
                username: cfg.get<string>('DB_USER'),
                password: cfg.get<string>('DB_PASS'),
                database: cfg.get<string>('DB_NAME'),
              }),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          entities: [
            User,
            Role,
            Permission,
            UserRole,
            RolePermission,
            RefreshToken,
          ],
          synchronize,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
