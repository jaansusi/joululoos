import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
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
  async home(@Req() request: Request) {
    if (request.query.code === undefined && request.cookies['santa_auth'])
      request.query.code = request.cookies['santa_auth'];
    if (request.query.code) {
      let user = await this.userRepository.findOne({ where: { decryptionCode: request.cookies['santa_auth'] } });
      if (user)
        return {
          inputType: 'password',
          prefill: request.query.code,
          isAdmin: user.isAdmin,
          loggedIn: request.cookies['santa_auth'] !== undefined,
        };
    }
    return { inputType: 'text' };
  }

  @Post('result')
  // @Render('result')
  async showResult(@Req() request: Request, @Body() body: any) {
    if (request.cookies['santa_auth']) {
      request.query.code = request.cookies['santa_auth'];
    }
    if (!body.code) {
      return { error: 'Vigane päring!' };
    }
    let user = await this.userRepository.findOne({ where: { decryptionCode: body.code } });
    if (!user)
      return { error: 'Seda koodi ei leitud süsteemist!' };
    request.res.cookie('santa_auth', user.decryptionCode, { maxAge: 5184000000, httpOnly: false });
    return { name: user.name, giftingTo: user.giftingTo };
  }
}
