import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { title: 'P1', description: 'D1', price: 10 };
      const req = { user: { sub: 'user_id' } };
      await controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, 'user_id');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      await controller.findOne('id');
      expect(service.findOne).toHaveBeenCalledWith('id');
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { title: 'U1' };
      const req = { user: { sub: 'user_id' } };
      await controller.update('id', dto, req);
      expect(service.update).toHaveBeenCalledWith('id', dto, 'user_id');
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const req = { user: { sub: 'user_id' } };
      await controller.remove('id', req);
      expect(service.remove).toHaveBeenCalledWith('id', 'user_id');
    });
  });
});
