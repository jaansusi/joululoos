import { Injectable } from '@nestjs/common';

@Injectable()
export class LotteryService {
  getHello(): string {
    return 'Hello World!';
  }
}