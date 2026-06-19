import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller({ version: '1', path: '/health' })
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator
  ) {}

  @Get()
  check() {
    return this.healthCheckService.check([
      () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
      () =>
        this.memoryHealthIndicator.checkRSS('memory_rss', 150 * 1024 * 1024),
      () =>
        this.typeOrmHealthIndicator.pingCheck('database', { timeout: 3000 }),
    ]);
  }
}
