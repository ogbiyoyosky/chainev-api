import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../../../test/mocks/repository/repository.mock';
import { Repository } from 'typeorm';
import { mockProjectEnvironment, mockUser } from '../../../../test/mocks/data';
import { ProjectEventService } from '../../project-event/services/project-event.service';
import { ProjectEnvironmentService } from './project-environment.service';

import { User } from '../../user/entities/user.entity';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options.interface';
import { projectEventServiceMock } from '../../../../test/mocks/services';
import { ProjectEnvironment } from '../entities/project-environment.entity';
import { ProjectEnvironmentNetworkType } from '../enum/project-environment.enum';

describe('ProjectEnvironmentService', () => {
  let projectEnvironmentService: ProjectEnvironmentService;
  let repositoryMock: Repository<ProjectEnvironment>;
  let projectEventService: ProjectEventService;
  let options: ServiceMethodOptions;

  beforeEach(async () => {
    options = {
      currentUser: mockUser as User,
      pagination: { skip: 0, take: 10 },
    };

    const userModule: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ProjectEnvironment),
          useFactory: repositoryMockFactory,
        },
        ProjectEventService,
        ProjectEnvironmentService,
      ],
    })
      .overrideProvider(ProjectEventService)
      .useValue(projectEventServiceMock)
      .compile();

    repositoryMock = userModule.get(getRepositoryToken(ProjectEnvironment));
    projectEnvironmentService = userModule.get<ProjectEnvironmentService>(
      ProjectEnvironmentService,
    );
    projectEventService =
      userModule.get<ProjectEventService>(ProjectEventService);
  });

  describe('Check For Duplicate Project Environment', () => {
    describe('When a duplicate network type exists for the specified project', () => {
      it('should throw a bad request error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockReturnValue(
            Promise.resolve(mockProjectEnvironment as ProjectEnvironment),
          );

        try {
          await projectEnvironmentService.checkDuplicateProjectEnvironment(
            mockProjectEnvironment.networkType,
            mockProjectEnvironment.id,
          );
        } catch (error: any) {
          expect(error.message).toBe(
            `You already have your ${mockProjectEnvironment.networkType.toLowerCase()} environment set up`,
          );
        }
      });
    });
  });

  describe('Create Project Environment', () => {
    it('should create a project environment', async () => {
      const saveSpy = jest.spyOn(projectEnvironmentService, 'save');

      const checkDuplicateProjectEnvironmentSpy = jest
        .spyOn(projectEnvironmentService, 'checkDuplicateProjectEnvironment')
        .mockImplementation(() => null);

      await projectEnvironmentService.create(
        {
          networkType: mockProjectEnvironment.networkType,
          address: mockProjectEnvironment.address,
          webhookUrl: mockProjectEnvironment.webhookUrl,
          projectId: mockProjectEnvironment.projectId,
        },
        options,
      );

      expect(saveSpy).toHaveBeenCalled();
      expect(checkDuplicateProjectEnvironmentSpy).toHaveBeenCalled();
    });
  });

  describe('Update project environment', () => {
    const projectId = mockProjectEnvironment.id;

    it('should update a project environment when project environment is found', async () => {
      jest
        .spyOn(repositoryMock, 'findOne')
        .mockReturnValue(
          Promise.resolve(mockProjectEnvironment as ProjectEnvironment),
        );

      const saveSpy = jest.spyOn(projectEnvironmentService, 'save');

      await projectEnvironmentService.update(
        projectId,
        { address: mockProjectEnvironment.address },
        options,
      );

      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw a not found error when project environment is not found', async () => {
      jest
        .spyOn(repositoryMock, 'findOne')
        .mockReturnValue(Promise.resolve(null));

      try {
        await projectEnvironmentService.update(
          projectId,
          { address: mockProjectEnvironment.address },
          options,
        );
      } catch (error: any) {
        expect(error.message).toBe('Project environment not found');
      }
    });
  });

  describe('Build Filter', () => {
    let queryObject: object;

    beforeEach(() => {
      queryObject = {};
    });

    it('should return an empty object literal if input object is empty', () => {
      const actual = projectEnvironmentService.buildFilter(queryObject);
      expect(actual).toEqual({});
    });

    it('should return filter object with a networkType property', () => {
      queryObject = { networkType: ProjectEnvironmentNetworkType.MAINNET };

      const actual = projectEnvironmentService.buildFilter(queryObject);

      expect(actual).toHaveProperty('networkType');
    });

    it('should return filter object with a projectId property', () => {
      queryObject = { projectId: mockProjectEnvironment.projectId };

      const actual = projectEnvironmentService.buildFilter(queryObject);

      expect(actual).toHaveProperty('projectId');
    });

    it('should return filter object with a userId property', () => {
      queryObject = { userId: mockProjectEnvironment.userId };

      const actual = projectEnvironmentService.buildFilter(queryObject);

      expect(actual).toHaveProperty('userId');
    });
  });

  describe('Build Text Search Query', () => {
    it('should call SelectQueryBuilder.andWhere method if the search term is not empty', () => {
      const queryBuilder = repositoryMock.createQueryBuilder();
      const searchTerm = 'aaa';
      const selectQueryBuilderAndWhereMethodSpy = jest.spyOn(
        queryBuilder,
        'andWhere',
      );

      projectEnvironmentService.buildSearchQuery(queryBuilder, searchTerm);

      expect(selectQueryBuilderAndWhereMethodSpy).toHaveBeenCalled();
    });

    it('should not call SelectQueryBuilder.andWhere method if the search term is falsy', () => {
      const queryBuilder = repositoryMock.createQueryBuilder();
      const searchTerm = '';
      const selectQueryBuilderAndWhereMethodSpy = jest.spyOn(
        queryBuilder,
        'andWhere',
      );

      projectEnvironmentService.buildSearchQuery(queryBuilder, searchTerm);

      expect(selectQueryBuilderAndWhereMethodSpy).not.toHaveBeenCalled();
    });
  });

  describe('Verify method', () => {
    describe('when project environment can be found', () => {
      it('should return project environment', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() =>
            Promise.resolve(mockProjectEnvironment as ProjectEnvironment),
          );

        const actual = await projectEnvironmentService.verify(
          mockProjectEnvironment.id,
        );

        expect(actual).toBeDefined();
        expect(actual.address).toBe(mockProjectEnvironment.address);
      });
    });

    describe('when project environment can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await projectEnvironmentService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('Project environment not found');
        }
      });
    });
  });

  describe('Find By Project Id', () => {
    it('should call repository.find', async () => {
      const finSpy = jest
        .spyOn(repositoryMock, 'find')
        .mockImplementation(() =>
          Promise.resolve([mockProjectEnvironment] as ProjectEnvironment[]),
        );

      const actual = await projectEnvironmentService.findByProjectId(
        mockProjectEnvironment.id,
      );

      expect(finSpy).toHaveBeenCalled();
      expect(actual).toEqual([mockProjectEnvironment]);
    });
  });

  describe('Find By Id', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementation(() =>
          Promise.resolve(mockProjectEnvironment as ProjectEnvironment),
        );

      const actual = await projectEnvironmentService.findById(
        mockProjectEnvironment.id,
      );

      expect(finOneSpy).toHaveBeenCalled();
      expect(actual).toEqual(mockProjectEnvironment);
    });
  });

  describe('Find All Project Environments', () => {
    it('should call repository.findOne', async () => {
      const createQueryBuilderSpy = jest.spyOn(
        repositoryMock,
        'createQueryBuilder',
      );

      await projectEnvironmentService.find({ ...options, query: {} });
      expect(createQueryBuilderSpy).toHaveBeenCalled();
    });
  });

  describe('Find One', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest.spyOn(repositoryMock, 'findOne');

      await projectEnvironmentService.findOne(
        mockProjectEnvironment.id,
        options,
      );

      expect(finOneSpy).toHaveBeenCalled();
    });

    describe('when project environment can be found', () => {
      it('should return project environment', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() =>
            Promise.resolve(mockProjectEnvironment as ProjectEnvironment),
          );

        const actual = await projectEnvironmentService.verify(
          mockProjectEnvironment.id,
        );

        expect(actual).toBeDefined();
        expect(actual.address).toBe(mockProjectEnvironment.address);
      });
    });

    describe('when project environment can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await projectEnvironmentService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('Project environment not found');
        }
      });
    });
  });

  describe('Delete Project Environment', () => {
    describe('when project environment can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await projectEnvironmentService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('Project environment not found');
        }
      });
    });

    describe('when project environment can be found', () => {
      it('should should call the projectEventService.deQueuePollingJob', async () => {
        let projectId = mockProjectEnvironment.id;
        const projectEventServiceDeQueuePollingJobSpy = jest.spyOn(
          projectEventService,
          'deQueuePollingJob',
        );

        await projectEnvironmentService.delete(projectId, options);
        expect(projectEventServiceDeQueuePollingJobSpy).toHaveBeenCalled();
      });

      it('should should call the projectEnvironmentRepo.delete', async () => {
        let projectId = mockProjectEnvironment.id;
        const deleteMethodSpy = jest.spyOn(repositoryMock, 'delete');

        await projectEnvironmentService.delete(projectId, options);
        expect(deleteMethodSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Update Last Recorded Block Number', () => {
    it('it should call projectEventService.count method', async () => {
      const environment = mockProjectEnvironment as ProjectEnvironment;
      const lastRecordedBlockNumber = 100000222;

      const saveMethodSpy = jest.spyOn(projectEnvironmentService, 'save');

      const actual =
        await projectEnvironmentService.updateLastRecordedBlockNumber(
          environment,
          lastRecordedBlockNumber,
          options,
        );
      expect(saveMethodSpy).toHaveBeenCalled();
      expect(actual.lastRecordedBlockNumber).toBe(lastRecordedBlockNumber);
    });
  });
});
