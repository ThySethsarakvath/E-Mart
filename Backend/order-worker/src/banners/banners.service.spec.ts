import { Test, TestingModule } from '@nestjs/testing';
import { BannersService } from './banners.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Banner } from './entity/banner.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('BannersService', () => {
  let service: BannersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannersService,
        { provide: getRepositoryToken(Banner), useValue: {} },
        { provide: CloudinaryService, useValue: {} },
      ],
    }).compile();

    service = module.get<BannersService>(BannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
