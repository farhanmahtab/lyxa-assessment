import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { ProductsModule } from './modules/products/products.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://admin:secret@localhost:27017/lyxa_products?authSource=admin',
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    ProductsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
