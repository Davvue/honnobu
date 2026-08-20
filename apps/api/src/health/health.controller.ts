import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
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
  check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      (): Promise<HealthIndicatorResult<'memory_heap'>> =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
      (): Promise<HealthIndicatorResult<'memory_rss'>> =>
        this.memoryHealthIndicator.checkRSS('memory_rss', 150 * 1024 * 1024),
      (): Promise<HealthIndicatorResult<'database'>> =>
        this.typeOrmHealthIndicator.pingCheck('database', { timeout: 3000 }),
    ]);
  }
}
