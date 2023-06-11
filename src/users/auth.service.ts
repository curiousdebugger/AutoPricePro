import { BadGatewayException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);


@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signUp(email: string, password: string) {
    // See if user is in use
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadGatewayException('Email already in use.');
    }

    // HAsh User Passwords

    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Has the salt and the password together
    const hashed = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together
    const result = salt + '.' + hashed.toString('hex');

    // Create new user and save it
    const user  = await this.userService.create(email, result);

    // return the user
    return user;
  }

  signIn() {}
}
