import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('AUTH_DB_HOST'),
        port: Number(cfg.get('AUTH_DB_PORT')),
        username: cfg.get('AUTH_DB_USER'),
        password: cfg.get('AUTH_DB_PASS'),
        database: cfg.get('AUTH_DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // IMPORTANT: use migrations in real projects
      }),
    }),
  ],
})
export class DatabaseModule {}
