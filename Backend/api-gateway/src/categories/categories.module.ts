import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from './entities/categories.entity';
import { SubCategory } from './entities/subcategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categories, SubCategory])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
