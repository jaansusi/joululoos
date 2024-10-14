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
    const cleanedEmail = this.userService.cleanGmailAddress(req.user.email);
    const existingUser = await this.userService.getByEmail(cleanedEmail);
    if (existingUser) {
      return existingUser;
    }
    const allUsers = await this.userService.findAll();
    console.log(allUsers);
    if (allUsers.length === 0) {
      // If no users exist, create an admin user with the Google login
      let newUserDto = new CreateUserDto();
      newUserDto.name = req.user.displayName;
      newUserDto.email = cleanedEmail;
      newUserDto.isAdmin = true;
      await this.userService.createUser(newUserDto);
    }

    return await this.userService.findOne({ where: { email: cleanedEmail } }).then(user => {
      if (!user) {
        return null;
      }
      return user;
    });
  }
}