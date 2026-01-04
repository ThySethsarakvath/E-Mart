/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateArrivalDto } from './create-arrivals.dto';

export class UpdateArrivalDto extends PartialType(CreateArrivalDto) {}
