import { Controller, Get, Render, Req } from '@nestjs/common';
import { HomeService } from './home.service';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';

@Controller()
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    @InjectModel(User) private userRepository: typeof User,
  ) { }

  @Get()
  @Render('index')
  home(@Req() request: Request) {
    return { prefill: request.query.code };
  }

  @Get('showResult')
  @Render('result')
  async showResult(@Req() request: Request) {
    if (!request.query.code) {
      return { result: 'Vigane päring!' };
    }
    let response = await this.userRepository.findOne({ where: { decryptionCode: request.query.code } }).then(user => {
      if (!user) {
        return 'Seda koodi ei leitud süsteemist!';
      } else {
        return user.giftingTo;
      }
    });
    return { result: response };
  }
}
