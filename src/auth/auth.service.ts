import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
  ) { }

  async getUserWithGoogleLogin(req): Promise<User> {
    if (!req.user) {
      return null;
    }
    console.log(req.user);
    const existingUser = await this.userService.getByEmail(req.user.email);
    if (existingUser) {
      return existingUser;
    }
    const allUsers = await this.userService.findAll();
    if (allUsers.length === 0) {
      // If no users exist, create an admin user with the Google login
      let newUserDto = new CreateUserDto();
      newUserDto.name = req.user.displayName;
      newUserDto.email = req.user.email;
      newUserDto.isAdmin = true;
      this.userService.createUser(newUserDto);
    }
    // Remove dots and spaces from email. Google sometimes leaves dots in, sometimes not.
    return await this.userService.findOne({ where: { email: req.user.email.replace(/\./g, '') } }).then(user => {
      if (!user) {
        return null;
      }
      return user;
    });
  }
}