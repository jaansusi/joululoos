import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FamilyService } from 'src/family/family.service';

@Controller()
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly familyService: FamilyService,
    ) { }

    @Get('users')
    async getUsers() {
        return this.userService.findAll();
    }

    @Post('user')
    async createUser(@Body() userDto: CreateUserDto) {
        return this.userService.createUser(userDto);
    }
}
