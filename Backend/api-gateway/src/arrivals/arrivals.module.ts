import { Module } from '@nestjs/common';
import { ArrivalsController } from './arrivals.controller';
import { ArrivalsService } from './arrivals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arrival } from './entities/arrivals.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Arrival])],
  controllers: [ArrivalsController],
  providers: [ArrivalsService],
})
export class ArrivalsModule {}
