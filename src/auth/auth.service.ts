import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
  ) { }

  async getUserWithGoogleLogin(req): Promise<User> {
    if (!req.user) {
      return null;
    }
    console.log(req.user);
    return await this.userRepository.findOne({ where: { email: req.user.email } }).then(user => {
      if (!user) {
        return null;
      }
      return user;
    });
  }
}