import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.model';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, ownerId: string) {
    return this.productModel.create({
      ...createProductDto,
      ownerId,
    });
  }

  async findAll() {
    return this.productModel.find().exec();
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, ownerId: string) {
    const product = await this.findOne(id);
    if (product.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this product');
    }
    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }

  async remove(id: string, ownerId: string) {
    const product = await this.findOne(id);
    if (product.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this product');
    }
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
