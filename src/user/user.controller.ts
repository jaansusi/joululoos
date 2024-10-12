import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class UserController {
    constructor(
        private readonly userService: UserService,
        @InjectModel(User) private userRepository: typeof User,
    ) { }

    @Get('users')
    async getUsers() {
        return this.userService.findAll();
    }

    @Post('user')
    async createUser(@Body() userDto: CreateUserDto) {
        let user = new User();
        user.name = userDto.name;
        user.email = userDto.email;

        for (const restrictedUserId of userDto.restrictedUsers) {
            let restrictedUser = await this.userService.getUserById(parseInt(restrictedUserId));
            if (restrictedUser !== null)
                user.restrictions.push(restrictedUser);
        }
        return this.userService.createUser(user);
    }
}
