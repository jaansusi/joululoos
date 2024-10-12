import { Module } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
    controllers: [AdminController],
    imports: [SequelizeModule.forFeature([User])],
    providers: [AdminService],
})
export class AdminModule { }
