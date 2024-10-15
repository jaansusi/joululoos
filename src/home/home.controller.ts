import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { EncryptionService, EncryptionStrategy } from 'src/encryption/encryption.service';

@Controller()
export class HomeController {
  constructor(
    private readonly userService: UserService,
    private readonly encryptionService: EncryptionService,
  ) { }

  @Get()
  @Render('index')
  async home(@Req() request: Request): Promise<any> {
    if (request.cookies['santa_auth']) {
      let user = await this.userService.findOne({ where: { id: request.cookies['santa_auth'] } });
      if (user) {
        switch (user.encryptionStrategy) {
          case EncryptionStrategy.CODE:
            return {
              inputType: 'password',
              prefill: user.decryptionCode,
              loggedIn: true,
              isAdmin: user.isAdmin,
            };
        }
      }
    }
    if (request.query.code) {
      let user = await this.userService.findOne({ where: { decryptionCode: request.query.code } });
      if (user) {
        request.res.cookie('santa_auth', user.id, { maxAge: 5184000000, httpOnly: false });
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
    request.res.cookie('santa_auth', user.id, { maxAge: 5184000000, httpOnly: false });
    // To-do: logic based on users encryption strategy
    // To-do: code decryption should use input, not the db value
    let giftingTo = await this.encryptionService.decryptGiftingTo(user);
    return { name: user.name, giftingTo: giftingTo };
  }
}
