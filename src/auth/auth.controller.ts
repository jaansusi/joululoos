import { GoogleOAuthGuard } from './google-oauth.guard';
import { Controller, Get, Redirect, Render, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Request() req) { }

    @Get('google-redirect')
    @UseGuards(GoogleOAuthGuard)
    @Render('result')
    async googleAuthRedirect(@Request() req) {
        try {
            const result = await this.authService.getSecretWithGoogleLogin(req);
            return { result: result, success: true };
        } catch (error) {
            return { result: error.message };
        }
    }
}