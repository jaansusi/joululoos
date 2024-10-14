import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { HomeService } from './home.service';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Controller()
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    private readonly userService: UserService,
  ) { }

  @Get()
  @Render('index')
  async home(@Req() request: Request) {
    // if (request.cookies['santa_auth_provider']) {
    //   switch(request.cookies['santa_auth_provider']) {
    //     case 'google':
    //       return { loggedIn: true, isAdmin: false };
    //     default:
    //       return { loggedIn: true, isAdmin: false };
    //   }
    // }

    if (request.cookies['santa_auth']) {
      let user = await this.userService.findOne({ where: { id: request.cookies['santa_auth'] } });
      if (user) {
        return { loggedIn: true, isAdmin: user.isAdmin };
      }
    }
    if (request.query.code) {
      let user = await this.userService.findOne({ where: { decryptionCode: request.query.code } });
      if (user) {
        request.res.cookie('santa_auth', user.decryptionCode, { maxAge: 5184000000, httpOnly: false });
        return {
          inputType: 'password',
          prefill: request.query.code,
          isAdmin: user.isAdmin,
          loggedIn: true,
        };
      }
      else
        return { inputType: 'text', error: 'Vigane kood!' };
    }
    return { inputType: 'text', };
  }

  @Post('result')
  async showResult(@Req() request: Request, @Body() body: any) {
    if (request.cookies['santa_auth']) {
      request.query.code = request.cookies['santa_auth'];
    }
    if (!body.code) {
      return { error: 'Vigane päring!' };
    }
    let user = await this.userService.findOne({ where: { decryptionCode: body.code } });
    if (!user)
      return { error: 'Seda koodi ei leitud süsteemist!' };
    request.res.cookie('santa_auth', user.decryptionCode, { maxAge: 5184000000, httpOnly: false });
    return { name: user.name, giftingTo: user.giftingTo };
  }
}
