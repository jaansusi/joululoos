import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserRestriction } from './entities/user-restriction.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  imports: [SequelizeModule.forFeature([User, UserRestriction])],
  providers: [UserService],
})
export class UserModule {}
