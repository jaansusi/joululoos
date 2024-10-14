import { Module } from '@nestjs/common';
import { HomeController } from './home/home.controller';
import { HomeService } from './home/home.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { UserModule } from './user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { dataBaseConfig } from './database/database.config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';

// to-do: Check if this list really should be that long, I doubt it...
@Module({
  imports: [ConfigModule.forRoot(), UserModule, FamilyModule, AdminModule, AuthModule, SequelizeModule.forRoot(dataBaseConfig)],
  controllers: [HomeController, AuthController],
  providers: [HomeService],
})
export class AppModule { }