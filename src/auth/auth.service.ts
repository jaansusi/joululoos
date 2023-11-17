import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
  ) { }

  async getSecretWithGoogleLogin(req): Promise<any> {
    if (!req.user) {
      return 'Vigane autentimine!';
    }
    console.log(req.user);
    return await this.userRepository.findOne({ where: { email: req.user.email } }).then(user => {
      if (!user) {
        return 'Selle e-mailiga kasutaja ei ole süsteemis, kasuta koodi!';
      } else {
        return {
          decryptionCode: user.decryptionCode,
          giftingTo: user.giftingTo
        };
      }
    });
  }
}