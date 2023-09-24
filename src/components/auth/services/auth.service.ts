import {
  Injectable,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/services/user.service';
import {
  AuthJWTInput,
  RegisterInput,
  LoginInput,
  LoggedInState,
} from '../interfaces/auth.interface';
import { User } from '../../user/entities/user.entity';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options.interface';
import { getManager } from 'typeorm';

@Injectable()
export class AuthService {
  JWT_AUTH_SECRET: string = process.env.JWT_AUTH_SECRET;
  JWT_EXPIRATION_PERIOD_MS = 604800000;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Generates JWT for a user
   * @param payload - An object containing the ID and email of a user
   * @returns { string } - JWT
   */
  generateJWT(payload: AuthJWTInput): string {
    return jwt.sign({ ...payload, date: Date.now() }, this.JWT_AUTH_SECRET, {
      expiresIn: this.JWT_EXPIRATION_PERIOD_MS,
    });
  }

  /**
   * Composes the login data
   */
  composeLoginData(user: User, token: string): LoggedInState {
    return {
      uuid: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.firstName,
      email: user.email,
      token,
    };
  }

  /**
   * Creates a new user account
   */
  async register(input: RegisterInput): Promise<Partial<User>> {
    let user = await this.userService.create(input, {});

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }

  /**
   * Logs a user in
   */
  async login(input: LoginInput): Promise<LoggedInState> {
    const genericMessage = 'Invalid email or password';
    const user = await this.userService.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException(genericMessage);
    }

    const match = await bcrypt.compare(input.password, user.password);

    if (!match) {
      throw new UnauthorizedException(genericMessage);
    }

    const jwt = this.generateJWT({
      id: user.id,
      email: user.email,
    });

    return this.composeLoginData(user, jwt);
  }
}
