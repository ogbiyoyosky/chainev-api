import { Test } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';
import { mockUser } from '../../../../test/mocks/data';
import { UserService } from '../../user/services/user.service';
import { userServiceMock } from '../../../../test/mocks/services';
import { User } from 'src/components/user/entities/user.entity';

describe('Auth Controller Test Suite', () => {
  let authService: AuthService;
  let authController: AuthController;

  beforeEach(async () => {
    const authModule = await Test.createTestingModule({
      providers: [AuthService, UserService],
      controllers: [AuthController],
    })
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();

    authService = authModule.get<AuthService>(AuthService);
    authController = authModule.get<AuthController>(AuthController);
  });

  describe('Registration Endpoint', () => {
    it('should call authService.register method', async () => {
      const authServiceLoginMethodSpy = jest.spyOn(authService, 'register');

      await authController.register({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        businessName: mockUser.businessName,
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(authServiceLoginMethodSpy).toHaveBeenCalled();
    });
  });

  describe('Login Endpoint', () => {
    it('should call authService.login method', async () => {
      const authServiceLoginMethodSpy = jest
        .spyOn(authService, 'login')
        .mockImplementation(() => mockUser as any);

      await authController.login({
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(authServiceLoginMethodSpy).toHaveBeenCalled();
    });
  });
});
