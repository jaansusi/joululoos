import { GoogleStrategy } from './auth/google.strategy';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { dataBaseConfig } from './database/database.config';
import { LotteryController } from './lottery/lottery.controller';
import { AdminController } from './admin/admin.controller';
import { LotteryService } from './lottery/lottery.service';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [ConfigModule.forRoot(), UserModule, SequelizeModule.forRoot(dataBaseConfig)],
  controllers: [AppController, AuthController, LotteryController, AdminController],
  providers: [AppService, LotteryService, AdminService, AuthService, GoogleStrategy],
})
export class AppModule { }