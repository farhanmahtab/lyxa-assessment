import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { User } from './user.model';

@Module({
  imports: [TypegooseModule.forFeature([User])],
  exports: [TypegooseModule.forFeature([User])],
})
export class UsersModule {}
