import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.model';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: any;

  const mockProduct = {
    _id: 'product_id',
    title: 'Test Product',
    description: 'Description',
    price: 100,
    ownerId: 'owner_id',
  };

  const mockProductModel = {
    create: jest.fn().mockResolvedValue(mockProduct),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = { title: 'Test Product', description: 'Description', price: 100 };
      const result = await service.create(dto, 'owner_id');
      expect(result).toEqual(mockProduct);
      expect(model.create).toHaveBeenCalledWith({ ...dto, ownerId: 'owner_id' });
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockProduct]) });
      const result = await service.findAll();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      model.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockProduct) });
      const result = await service.findOne('product_id');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if not found', async () => {
      model.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findOne('invalid_id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product if owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      model.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...mockProduct, title: 'Updated' }) });

      const result = await service.update('product_id', { title: 'Updated' }, 'owner_id');
      expect(result.title).toEqual('Updated');
    });

    it('should throw ForbiddenException if not owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      await expect(service.update('product_id', { title: 'Updated' }, 'wrong_owner')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a product if owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      model.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockProduct) });

      const result = await service.remove('product_id', 'owner_id');
      expect(result).toEqual(mockProduct);
    });

    it('should throw ForbiddenException if not owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      await expect(service.remove('product_id', 'wrong_owner')).rejects.toThrow(ForbiddenException);
    });
  });
});
