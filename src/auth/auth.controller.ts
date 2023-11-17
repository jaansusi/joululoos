import { GoogleOAuthGuard } from './google-oauth.guard';
import { Controller, Get, Render, UseGuards, Req, Res } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Req() req: Request) { }

    @Get('google-redirect')
    @UseGuards(GoogleOAuthGuard)
    @Render('result')
    async googleAuthRedirect(@Req() req: Request) {
        try {
            const result = await this.authService.getSecretWithGoogleLogin(req);
            req.res.cookie('santa_auth', result.decryptionCode, { maxAge: 5184000000, httpOnly: true });
            return { result: result.giftingTo, success: true };
        } catch (error) {
            return { result: error.message };
        }
    }
}