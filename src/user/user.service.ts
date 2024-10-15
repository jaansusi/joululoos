import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignUserDto } from './dto/assign-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private userRepository: typeof User,
    ) { }

    // to-do: deprecate "find" functions that pass through options, 
    // implement purpose-built functions for specific queries 
    async findAll(options?: any) {
        return this.userRepository.findAll(options);
    }

    async findOne(options: any) {
        return this.userRepository.findOne(options);
    }

    async createUser(user: CreateUserDto) {
        return this.userRepository.upsert({
            id: user.id ? user.id : undefined,
            name: user.name,
            email: user.email,
            encryptionStrategy: user.encryptionStrategy,
            isAdmin: user.isAdmin,
            familyId: user.familyId,

        });
    }

    async deleteUser(userId: number) {
        return this.userRepository.destroy({ where: { id: userId } });
    }

    async getById(id: number) {
        return this.userRepository.findByPk(id);
    }

    async getByEmail(email: string) {
        return this.userRepository.findOne({ where: { email } });
    }

    async updateUser(id: number, user: CreateUserDto|AssignUserDto) {
        return this.userRepository.update(user, { where: { id } });
    }

    public async truncate() {
        return this.userRepository.truncate();
    }

    public cleanGmailAddress(email: string) {
        // Remove dots and spaces from email. Google sometimes leaves dots in, sometimes not.
        email = email.replace(/^([^@+]+)(\+[^@]*)?@gmail\.com$/, (match, username) => {
            return username.replace(/\./g, '') + '@gmail.com';
        });
        console.log(email);
        return email;
    }
}