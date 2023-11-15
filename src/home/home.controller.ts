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
  home() {
    return { message: 'Hello world!' };
  }

  @Get('showResult')
  @Render('result')
  async showResult(@Req() request: Request) {
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
