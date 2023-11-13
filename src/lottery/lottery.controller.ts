import { Controller, Get } from '@nestjs/common';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Get()
  getHello(): string {
    return this.lotteryService.getHello();
  }
}
