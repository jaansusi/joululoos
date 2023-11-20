import { Module } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';

@Module({
    controllers: [AuthController],
    imports: [SequelizeModule.forFeature([User])],
    providers: [AuthService, GoogleStrategy],
})
export class AuthModule { }
