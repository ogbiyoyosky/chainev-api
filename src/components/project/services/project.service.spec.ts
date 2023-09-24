import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  entityManagerMockFactory,
  repositoryMockFactory,
} from '../../../../test/mocks/repository/repository.mock';
import { Repository } from 'typeorm';
import {
  mockProject,
  mockProjectEnvironment,
  mockProjectEvent,
  mockUser,
} from '../../../../test/mocks/data';
import { ProjectService } from './project.service';
import { Project } from '../entities/project.entity';
import { ProjectEventService } from '../../project-event/services/project-event.service';
import { ProjectEnvironmentService } from '../../project-environment/services/project-environment.service';
import { ProjectEnvironmentNetworkType } from '../../project-environment/enum/project-environment.enum';
import { User } from '../../user/entities/user.entity';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options.interface';
import {
  projectEnvironmentServiceMock,
  projectEventServiceMock,
} from '../../../../test/mocks/services';
import { ProjectState } from '../enum/project.enum';
import { ProjectEnvironment } from '../../project-environment/entities/project-environment.entity';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let repositoryMock: Repository<Project>;
  let projectEnvironmentService: ProjectEnvironmentService;
  let projectEventService: ProjectEventService;
  let options: ServiceMethodOptions;

  beforeEach(async () => {
    options = {
      currentUser: mockUser as User,
      pagination: { skip: 0, take: 10 },
    };

    const userModule: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useFactory: repositoryMockFactory,
        },
        ProjectEventService,
        ProjectEnvironmentService,
      ],
    })
      .overrideProvider(ProjectEnvironmentService)
      .useValue(projectEnvironmentServiceMock)
      .overrideProvider(ProjectEventService)
      .useValue(projectEventServiceMock)
      .compile();

    projectService = userModule.get<ProjectService>(ProjectService);
    repositoryMock = userModule.get(getRepositoryToken(Project));
    projectEnvironmentService = userModule.get<ProjectEnvironmentService>(
      ProjectEnvironmentService,
    );
    projectEventService =
      userModule.get<ProjectEventService>(ProjectEventService);
  });

  describe('Create Project', () => {
    it('should create a project', async () => {
      const transactionSpy = jest.spyOn(
        entityManagerMockFactory,
        'transaction',
      );

      await projectService.create(
        {
          name: mockProject.name,
          networkType: ProjectEnvironmentNetworkType.TESTNET,
          address: mockProjectEnvironment.address,
          abi: mockProject.abi,
          eventNames: mockProject.eventNames,
        },
        options,
      );

      expect(transactionSpy).toHaveBeenCalled();
    });
  });

  describe('Update project', () => {
    const projectId = mockProject.id;

    it('should update a project when project is found', async () => {
      jest
        .spyOn(repositoryMock, 'findOne')
        .mockReturnValue(Promise.resolve(mockProject as Project));

      const saveSpy = jest.spyOn(projectService, 'save');

      await projectService.update(
        projectId,
        {
          name: mockProject.name,
          abi: JSON.stringify([{ name: 'updated-name' }]),
        },
        options,
      );

      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw a not found error when project is not found', async () => {
      jest
        .spyOn(repositoryMock, 'findOne')
        .mockReturnValue(Promise.resolve(null));

      try {
        await projectService.update(
          projectId,
          { name: mockProject.name },
          options,
        );
      } catch (error: any) {
        expect(error.message).toBe('Project not found');
      }
    });
  });

  describe('Verify method', () => {
    describe('when project can be found', () => {
      it('should return project', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(mockProject as Project));

        const actual = await projectService.verify(mockProject.id);

        expect(actual).toBeDefined();
        expect(actual.name).toBe(mockProject.name);
      });
    });

    describe('when project can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await projectService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('Project not found');
        }
      });
    });
  });

  describe('Find By Id', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementation(() => Promise.resolve(mockProject as Project));

      const actual = await projectService.findById(mockProject.id);

      expect(finOneSpy).toHaveBeenCalled();
      expect(actual).toEqual(mockProject);
    });
  });

  describe('Find All Projects', () => {
    it('should call repository.findOne', async () => {
      const createQueryBuilderSpy = jest.spyOn(
        repositoryMock,
        'createQueryBuilder',
      );

      const actual = await projectService.find(options);

      expect(createQueryBuilderSpy).toHaveBeenCalled();
      // expect(actual).toEqual([mockProject]);
    });
  });

  describe('Find One', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementation(() => Promise.resolve(mockProject as Project));

      const actual = await projectService.findOne(mockProject.id, options);

      expect(finOneSpy).toHaveBeenCalled();
      expect(actual).toEqual(mockProject);
    });
  });

  describe('Find One', () => {
    describe('when project can be found', () => {
      it('should return project', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(mockProject as Project));

        const actual = await projectService.verify(mockProject.id);

        expect(actual).toBeDefined();
        expect(actual.name).toBe(mockProject.name);
      });
    });

    describe('when project can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await projectService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('Project not found');
        }
      });
    });
  });

  describe('Delete Project', () => {
    it('should should update the state of the project to SHUTTING_DOWN', async () => {
      let projectId = mockProject.id;
      const saveSpy = jest.spyOn(projectService, 'save');

      const actual = await projectService.delete(projectId, options);
      expect(saveSpy).toHaveBeenCalled();
      expect(actual.state).toBe(ProjectState.SHUTTING_DOWN);
    });
  });

  describe('Add Project Environment', () => {
    it('it should call projectEnvironmentService.create method', async () => {
      let projectId = mockProject.id;
      const projectEnvironmentServiceCreateMethodSpy = jest
        .spyOn(projectEnvironmentService, 'create')
        .mockReturnValue(
          Promise.resolve(mockProjectEnvironment as ProjectEnvironment),
        );

      const actual = await projectService.addEnvironment(
        projectId,
        {
          networkType: mockProjectEnvironment.networkType,
          address: mockProjectEnvironment.address,
          webhookUrl: mockProjectEnvironment.webhookUrl,
        },
        options,
      );
      expect(projectEnvironmentServiceCreateMethodSpy).toHaveBeenCalled();
      expect(actual.networkType).toBe(mockProjectEnvironment.networkType);
    });
  });

  describe('Find Project Environments', () => {
    it('it should call projectEnvironmentService.findByProjectId method', async () => {
      let projectId = mockProject.id;
      const projectEnvironmentServicefindByProjectIdMethodSpy = jest
        .spyOn(projectEnvironmentService, 'findByProjectId')
        .mockReturnValue(
          Promise.resolve([mockProjectEnvironment] as ProjectEnvironment[]),
        );

      const actual = await projectService.findEnvironments(projectId, options);

      expect(
        projectEnvironmentServicefindByProjectIdMethodSpy,
      ).toHaveBeenCalled();
      expect(actual).toEqual([mockProjectEnvironment]);
    });
  });

  describe('Remove Project Environment', () => {
    it('it should call projectEnvironmentService.delete method', async () => {
      let projectId = mockProject.id;
      let projectEnvironmentId = mockProjectEnvironment.id;
      const projectEnvironmentServiceDeleteMethodSpy = jest.spyOn(
        projectEnvironmentService,
        'delete',
      );

      await projectService.removeEnvironment(
        projectId,
        projectEnvironmentId,
        options,
      );

      expect(projectEnvironmentServiceDeleteMethodSpy).toHaveBeenCalled();
    });
  });

  describe('Remove Project Environment', () => {
    it('it should call projectEnvironmentService.delete method', async () => {
      let projectId = mockProject.id;
      let projectEnvironmentId = mockProjectEnvironment.id;
      const projectEnvironmentServiceDeleteMethodSpy = jest.spyOn(
        projectEnvironmentService,
        'delete',
      );

      await projectService.removeEnvironment(
        projectId,
        projectEnvironmentId,
        options,
      );

      expect(projectEnvironmentServiceDeleteMethodSpy).toHaveBeenCalled();
    });
  });

  describe('Find Project Events', () => {
    it('it should call projectEventService.find method', async () => {
      let projectId = mockProject.id;

      const projectEventServiceFindMethodSpy = jest.spyOn(
        projectEventService,
        'find',
      );

      await projectService.findEvents(projectId, options);

      expect(projectEventServiceFindMethodSpy).toHaveBeenCalled();
    });
  });

  describe('Find Project Event Count', () => {
    it('it should call projectEventService.count method', async () => {
      let projectId = mockProject.id;

      const projectEventServiceCountMethodSpy = jest.spyOn(
        projectEventService,
        'count',
      );

      await projectService.findEventCount(projectId, options);

      expect(projectEventServiceCountMethodSpy).toHaveBeenCalled();
    });
  });
});
