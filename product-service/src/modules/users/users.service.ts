import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: { email: string; name: string; authId: string }) {
    console.log(`💾 [Product Service] Synchronizing user: ${user.email}`);
    return this.userModel.findOneAndUpdate(
      { email: user.email }, 
      user,
      { upsert: true, returnDocument: 'after' }
    );
  }

  async findByAuthId(authId: string) {
    return this.userModel.findOne({ authId }).exec();
  }
}
