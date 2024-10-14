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
        return this.userRepository.create({
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    }

    async getById(id: number) {
        return this.userRepository.findByPk(id);
    }

    async getByEmail(email: string) {
        return this.userRepository.findOne({ where: { email } });
    }

    async updateUser(id: number, user: CreateUserDto) {
        return this.userRepository.update(user, { where: { id } });
    }

    async updateUsersAssignment(id: number, updateDto: AssignUserDto) {
        return this.userRepository.update(updateDto, { where: { id } });
    }

    public async truncate() {
        return this.userRepository.truncate();
    }
}