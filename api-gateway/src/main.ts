import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const specPath = path.join(process.cwd(), '..', 'api-specification(postman)', 'index.json');
  const swaggerDocument = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  app.enableCors();
  
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`API Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
