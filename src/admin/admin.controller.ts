import { Controller, Get, Redirect, Render, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { Family } from 'src/family/entities/family.entity';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly userService: UserService,
    ) { }

    @Get()
    @Render('admin')
    async admin(@Req() request: Request): Promise<any> {
        if (request.cookies['santa_auth']) {
            const id = request.cookies['santa_auth'];
            let user = await this.userService.getById(id);
            if (user && user.isAdmin) {
                const users = await this.userService.findAll({ order: [['name', 'ASC']], include: [{ model: Family }] });
                try {
                    const validation = await this.adminService.validateSantas();
                    return { info: 'Admin page', isAdmin: true, users: users, validationResult: validation };
                } catch (err) {
                    console.error(err);
                    return { info: 'Admin page', isAdmin: true, users: users };
                }
            }
        }
        return { info: 'Admin page' };
    }

    @Get('generate')
    @Redirect('/admin')
    async generateSantas(@Req() request: Request): Promise<any> {
        if (request.cookies['santa_auth']) {
            const id = request.cookies['santa_auth'];
            let user = await this.userService.getById(id);

            if (user && user.isAdmin) {
                await this.adminService.assignSantas();
                user = await this.userService.findOne({ where: { name: user.name } });
                request.res.cookie('santa_auth', user.decryptionCode, { maxAge: 5184000000, httpOnly: true });
                return;
            }
        }
        // Make sure that a list can be generated even without an admin user.
        let users = await this.userService.findAll({ where: { isAdmin: true } });
        if (users.length === 0) {
            await this.adminService.assignSantas();
        }
    }
}
