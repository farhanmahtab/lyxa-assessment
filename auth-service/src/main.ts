import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication Service with registration and login')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Connect to RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'auth_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);
  console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
bootstrap();
