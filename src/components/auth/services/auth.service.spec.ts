import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/services/user.service';
import { mockUser } from '../../../../test/mocks/data';
import { User } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { userServiceMock } from '../../../../test/mocks/services';

describe('Auth Service Test Suite', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const authModule: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService],
    })
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();

    authService = authModule.get<AuthService>(AuthService);
    userService = authModule.get<UserService>(UserService);
  });

  describe('Generating JWT', () => {
    it('should return a string', () => {
      authService.JWT_AUTH_SECRET = '123224242323';
      authService.JWT_EXPIRATION_PERIOD_MS = 1000;

      const token = authService.generateJWT({
        id: mockUser.id,
        email: mockUser.email,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('Compose Login Data', () => {
    it('should return a an object containing user properties and token property', () => {
      const token = '1234567';

      const actual = authService.composeLoginData(mockUser as User, token);

      expect(actual).toBeDefined();
      expect(actual.email).toBe(mockUser.email);
      expect(actual.token).toBe(token);
    });
  });

  describe('User Registration', () => {
    it('should call userService.create method', async () => {
      const userServiceCreateMethodSpy = jest.spyOn(userService, 'create');

      await authService.register({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        businessName: mockUser.businessName,
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(userServiceCreateMethodSpy).toHaveBeenCalled();
    });

    it('should return an object containing firstName, lastName and email of user', async () => {
      const expected = {
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
      };

      const actual = await authService.register({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        businessName: mockUser.businessName,
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(actual).toEqual(expected);
    });
  });

  describe('Login', () => {
    describe('When email or password is incorrect', () => {
      const genericErrorMessage = 'Invalid email or password';

      it('should throw an UnauthorizedException error when user is not found', async () => {
        userService.findByEmail = jest.fn().mockReturnValue(null);

        try {
          await authService.login({
            email: mockUser.email,
            password: mockUser.password,
          });
        } catch (error) {
          expect(error.message).toBe(genericErrorMessage);
        }
      });

      it('should throw an UnauthorizedException error when password do not match', async () => {
        const incorrectPassword = '123';
        const hashedPassword = await bcrypt.hash(mockUser.password, 2);

        userService.findByEmail = jest
          .fn()
          .mockReturnValue({ ...mockUser, password: hashedPassword });

        try {
          await authService.login({
            email: mockUser.email,
            password: incorrectPassword,
          });
        } catch (error) {
          expect(error.message).toBe(genericErrorMessage);
        }
      });
    });

    describe('When email and password are correct', () => {
      it('should return user composeed login data', async () => {
        const correctPassword = mockUser.password;
        const hashedPassword = await bcrypt.hash(mockUser.password, 2);
        const token = 'some-test-jwt';
        const composeLoginDataSpy = jest.spyOn(authService, 'composeLoginData');
        const generateJWTSpy = jest
          .spyOn(authService, 'generateJWT')
          .mockReturnValue(token);

        userService.findByEmail = jest
          .fn()
          .mockReturnValue({ ...mockUser, password: hashedPassword });

        const actual = await authService.login({
          email: mockUser.email,
          password: correctPassword,
        });

        expect(generateJWTSpy).toHaveBeenCalled();
        expect(composeLoginDataSpy).toHaveBeenCalled();
        expect(actual.token).toBe(token);
      });
    });
  });
});
