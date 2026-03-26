import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as proxy from 'express-http-proxy';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://127.0.0.1:3001';
    const productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL') || 'http://127.0.0.1:3002';

    if (req.path.startsWith('/auth')) {
      return (proxy as any)(authServiceUrl)(req, res, next);
    }

    if (req.path.startsWith('/products')) {
      return (proxy as any)(productServiceUrl)(req, res, next);
    }

    next();
  }
}
