import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check gateway and services health' })
  check() {
    const authUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001';
    const productUrl = this.configService.get<string>('PRODUCT_SERVICE_URL') || 'http://localhost:3002';

    return this.health.check([
      () => this.http.pingCheck('auth-service', `${authUrl}/health`),
      () => this.http.pingCheck('product-service', `${productUrl}/health`),
      () => ({
        gateway: {
          status: 'up',
          timestamp: new Date().toISOString(),
        },
      }),
    ]);
  }
}
