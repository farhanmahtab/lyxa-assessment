import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './user.model';
import { buildSchema } from '@typegoose/typegoose';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: buildSchema(User),
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class UsersModule {}
