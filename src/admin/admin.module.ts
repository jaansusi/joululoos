import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EncryptionService } from 'src/encryption/encryption.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    controllers: [AdminController],
    imports: [SequelizeModule.forFeature([User])],
    providers: [AdminService, EncryptionService, UserService],
})
export class AdminModule { }
