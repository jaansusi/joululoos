import { Controller, Get, Redirect, Render, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';


@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        @InjectModel(User) private userRepository: typeof User,
    ) { }

    @Get()
    @Render('admin')
    async admin(@Req() request: Request): Promise<any> {
        if (request.cookies['santa_auth']) {
            const auth = request.cookies['santa_auth'];
            let user = await this.userRepository.findOne({ where: { decryptionCode: auth } });
            if (user && user.isAdmin) {
                const validation = await this.adminService.validateSantas();
                return { info: 'Admin page', isAdmin: true, result: JSON.stringify(validation, null, 4) };
            }
        }
        return { info: 'Admin page' };
    }

    @Get('generate')
    @Redirect('/admin')
    async generateSantas(@Req() request: Request): Promise<any> {
        if (request.cookies['santa_auth']) {
            const auth = request.cookies['santa_auth'];
            let user = await this.userRepository.findOne({ where: { decryptionCode: auth } });
            if (user && user.isAdmin) {
                this.adminService.generateSantas();
                user = await this.userRepository.findOne({ where: { name: user.name } });
                request.res.cookie('santa_auth', user.decryptionCode, { maxAge: 5184000000, httpOnly: true });
            }
        }
    }
}
