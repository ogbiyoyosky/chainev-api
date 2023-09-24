import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../../components/user/entities/user.entity';
import { UserService } from '../../components/user/services/user.service';
import { AuthenticationSuccessResult } from '../interfaces/authentication-result.interface';

@Injectable()
class HTTPAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const authToken = this.resolveAuthToken(request);
      const result = (await this.validate(
        authToken,
      )) as AuthenticationSuccessResult;
      request['currentUser'] = result.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async resolveCurrentUser(userId: string): Promise<User> {
    let user: User;

    user = await this.userService.findById(userId);

    if (!user) {
      throw new Error('Account not found');
    }

    return user;
  }

  async validateBasedOnJWT(
    authToken: string,
  ): Promise<AuthenticationSuccessResult> {
    const encodedData = jwt.verify(
      authToken,
      process.env.JWT_AUTH_SECRET,
    ) as Partial<User>;

    const user = await this.resolveCurrentUser(encodedData.id);

    return { user };
  }

  resolveAuthToken(request: Request): string {
    const errorMessage = 'No authorization header';
    const authorization = request.headers['authorization'] as string;
    if (!authorization) throw new Error(errorMessage);
    return this.resolveJWT(authorization);
  }

  resolveJWT(requestAuthorizationHeader: string): string {
    const token = requestAuthorizationHeader.split(' ')[1];
    if (!token) throw new Error('Provide a Bearer token');
    return token;
  }

  async validate(
    authToken: string,
  ): Promise<AuthenticationSuccessResult | any> {
    throw new Error('Unimplemented');
  }
}

export class JWTHTTPAuthGuard extends HTTPAuthGuard {
  async validate(authToken: string): Promise<AuthenticationSuccessResult> {
    return this.validateBasedOnJWT(authToken);
  }
}
