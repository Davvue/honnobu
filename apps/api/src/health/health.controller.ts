import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';

@Controller({ version: '1', path: 'health' })
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly memoryHealthIndicator: MemoryHealthIndicator
  ) {}

  @Get()
  check() {
    return this.healthCheckService.check([
      () => this.memoryHealthIndicator.checkHeap('heap', 150 * 1024 * 1024),
      () => this.memoryHealthIndicator.checkRSS('rss', 150 * 1024 * 1024),
    ]);
  }
}
