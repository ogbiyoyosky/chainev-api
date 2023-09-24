import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { repositoryMockFactory } from '../../../../test/mocks/repository/repository.mock';
import { Repository } from 'typeorm';
import { mockUser } from '../../../../test/mocks/data';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UserService;
  let repositoryMock: Repository<User>;

  beforeEach(async () => {
    const userModule: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    userService = userModule.get<UserService>(UserService);
    repositoryMock = userModule.get(getRepositoryToken(User));
  });

  describe('Create user', () => {
    describe('when user with same email already exists', () => {
      it('should throw and duplicate email error', async () => {
        const checkDuplicateEmailSpy = jest.spyOn(
          userService,
          'checkDuplicateEmail',
        );

        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(mockUser as User));

        try {
          await userService.create(
            {
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              businessName: mockUser.businessName,
              email: mockUser.email,
              password: mockUser.password,
            },
            {},
          );
        } catch (error) {
          expect(error.message).toBe('This email address is already taken');
          expect(checkDuplicateEmailSpy).toHaveBeenCalled();
        }
      });
    });

    describe('when user with the same email does not exist', () => {
      it('should create a user', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        const checkDuplicateEmailSpy = jest.spyOn(
          userService,
          'checkDuplicateEmail',
        );
        const hashedPasswordSpy = jest.spyOn(userService, 'hashPassword');
        const constructEntityInstanceSpy = jest.spyOn(
          userService,
          'constructEntityInstance',
        );
        const saveSpy = jest.spyOn(userService, 'save');

        const user = await userService.create(
          {
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            businessName: mockUser.businessName,
            email: mockUser.email,
            password: mockUser.password,
          },
          {},
        );

        expect(hashedPasswordSpy).toHaveBeenCalled();
        expect(checkDuplicateEmailSpy).toHaveBeenCalled();
        expect(constructEntityInstanceSpy).toHaveBeenCalled();
        expect(saveSpy).toHaveBeenCalled();
        expect(user).toBeDefined();
        expect(user.email).toBe(mockUser.email);
      });
    });
  });

  describe('Verify method', () => {
    describe('when user can be found', () => {
      it('should return user', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(mockUser as User));

        const actual = await userService.verify(mockUser.id);

        expect(actual).toBeDefined();
        expect(actual.email).toBe(mockUser.email);
      });
    });

    describe('when user can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await userService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('User not found');
        }
      });
    });
  });

  describe('Find User By Id', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementation(() => Promise.resolve(mockUser as User));

      const actual = await userService.findById(mockUser.id);

      expect(finOneSpy).toHaveBeenCalled();
      expect(actual).toEqual(mockUser);
    });
  });

  describe('Find All Users', () => {
    it('should call repository.findOne', async () => {
      const finSpy = jest
        .spyOn(repositoryMock, 'find')
        .mockImplementation(() => Promise.resolve([mockUser] as User[]));

      const actual = await userService.findAll();

      expect(finSpy).toHaveBeenCalled();
      expect(actual).toEqual([mockUser]);
    });
  });

  describe('Find User By Email', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementation(() => Promise.resolve(mockUser as User));

      const actual = await userService.findById(mockUser.email);

      expect(finOneSpy).toHaveBeenCalled();
      expect(actual).toEqual(mockUser);
    });
  });

  describe('Compare Passwords', () => {
    let rawPassword = '12345678';
    let encryptedPassword: string;

    beforeEach(async () => {
      encryptedPassword = await bcrypt.hash(rawPassword, 2);
    });

    describe('When passwords do not match ', () => {
      it('should throw an error ', async () => {
        const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');

        const incorrectRawPassword = '123456';

        try {
          await userService.comparePasswords(
            incorrectRawPassword,
            encryptedPassword,
          );
        } catch (error) {
          expect(bcryptCompareSpy).toHaveBeenCalled();
          expect(error.message).toBe('Current password is incorrect');
        }
      });
    });

    describe('When passwords match ', () => {
      it('should run without error ', async () => {
        const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');

        await userService.comparePasswords(rawPassword, encryptedPassword);
        expect(bcryptCompareSpy).toHaveBeenCalled();
      });
    });
  });
});
