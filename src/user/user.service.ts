import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private userRepository: typeof User,
    ) { }

    async findAll(options?: any) {
        return this.userRepository.findAll(options);
    }

    async findOne(options: any) {
        return this.userRepository.findOne(options);
    }

    async createUser(user: User) {
        return this.userRepository.create({
            name: user.name,
            email: user.email,
            giftingTo: user.giftingTo,
            decryptionCode: user.decryptionCode,
            isAdmin: user.isAdmin,
        });
    }

    async getUserById(id: number) {
        return this.userRepository.findByPk(id);
    }

    public async truncate() {
        return this.userRepository.truncate();
    }
}