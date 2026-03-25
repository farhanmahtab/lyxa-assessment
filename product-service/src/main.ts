import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Product Service API')
    .setDescription('Product Management Service with Ownership authorization')
    .setVersion('1.0')
    .addTag('products')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT || 3002);
  console.log(`Product Service is running on: ${await app.getUrl()}`);
}
bootstrap();
