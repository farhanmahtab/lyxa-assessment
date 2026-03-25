import { Module, Global } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
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
  providers: [
    {
      provide: getModelToken(User.name),
      useFactory: (connection) => {
        return connection.model(User.name, buildSchema(User));
      },
      inject: [getModelToken(User.name)],
    }
  ],
  exports: [MongooseModule],
})
export class UsersModule {}
