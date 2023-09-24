import { Body, Controller, forwardRef, Inject, Post } from '@nestjs/common';
import { SuccessResponse } from '../../../shared/utils/response.utils';
import { CreateUserAccountDto, LoginDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('v1/auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * Signs up a new user
   */
  @Post('register')
  async register(@Body() body: CreateUserAccountDto) {
    const user = await this.authService.register(body);
    return SuccessResponse('User account was created successfully', user);
  }

  /**
   * Attempts to log in a user
   */
  @Post('login')
  async login(@Body() body: LoginDto) {
    const loginData = await this.authService.login(body);
    return SuccessResponse('Logged in successfully', loginData);
  }
}
