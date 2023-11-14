import { Controller, Get, Render } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @Render('index')
  home() {
    return { message: 'Hello world!' };
  }

  @Get('showResult')
  @Render('result')
  showResult(obj: any) {
    console.log(obj);
    return { result: 'Hello world!' };
  }
}
