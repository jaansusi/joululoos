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
    if (request.cookies['santa_auth']) {
      return {
        prefill: request.cookies['santa_auth'],
        inputType: 'password',
        disableGoogleAuth: true
      };

    }
    if (request.query.code) {
      return { inputType: 'password', prefill: request.query.code };
    }
    return { inputType: 'text' };
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
        request.res.cookie('santa_auth', user.decryptionCode, { maxAge: 5184000000, httpOnly: true });
        return user.giftingTo;
      }
    });
    return { result: response, success: true };
  }
}
