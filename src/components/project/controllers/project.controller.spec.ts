import { Test } from '@nestjs/testing';
import { ProjectService } from '../services/project.service';
import { ProjectController } from './project.controller';
import { repositoryMockFactory } from '../../../../test/mocks/repository/repository.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from '../entities/project.entity';
import { ProjectEnvironmentService } from '../../project-environment/services/project-environment.service';
import { ProjectEventService } from '../../project-event/services/project-event.service';
import {
  projectEnvironmentServiceMock,
  projectEventServiceMock,
  projectServiceMock,
  userServiceMock,
} from '../../../../test/mocks/services';
import {
  mockProject,
  mockProjectEnvironment,
  mockRequestInstance,
} from '../../../../test/mocks/data';
import { UserService } from '../../user/services/user.service';

describe('Project Controller', () => {
  const projectId = mockProject.id;
  let projectController: ProjectController;
  let projectService: ProjectService;

  beforeEach(async () => {
    const projectModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Project),
          useValue: repositoryMockFactory,
        },
        ProjectService,
        ProjectEnvironmentService,
        ProjectEventService,
        UserService,
      ],
      controllers: [ProjectController],
    })
      .overrideProvider(ProjectService)
      .useValue(projectServiceMock)
      .overrideProvider(ProjectEnvironmentService)
      .useValue(projectEnvironmentServiceMock)
      .overrideProvider(ProjectEventService)
      .useValue(projectEventServiceMock)
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();

    projectController = projectModule.get<ProjectController>(ProjectController);

    projectService = projectModule.get<ProjectService>(ProjectService);
  });

  describe('Create Project', () => {
    it('should call projectService.create', async () => {
      jest.spyOn(projectService, 'create');

      await projectController.createProject(mockRequestInstance, {
        name: mockProject.name,
        networkType: mockProjectEnvironment.networkType,
        address: mockProjectEnvironment.address,
        abi: mockProject.abi,
        eventNames: mockProject.eventNames,
        webhookUrl: mockProjectEnvironment.webhookUrl,
      });

      expect(projectService.create).toHaveBeenCalled();
    });
  });

  describe('Find Projects', () => {
    it('should call projectService.find', async () => {
      jest.spyOn(projectService, 'find');

      await projectController.findProjects(mockRequestInstance);
      expect(projectService.find).toHaveBeenCalled();
    });
  });

  describe('Find A Project', () => {
    it('should call projectService.findOne', async () => {
      jest.spyOn(projectService, 'findOne');

      await projectController.findProject(mockRequestInstance, projectId);
      expect(projectService.findOne).toHaveBeenCalled();
    });
  });

  describe('Update A Project', () => {
    it('should call projectService.update', async () => {
      jest.spyOn(projectService, 'update');

      await projectController.updateProject(mockRequestInstance, projectId, {
        abi: mockProject.abi,
      });
      expect(projectService.update).toHaveBeenCalled();
    });
  });

  describe('Delete A Project', () => {
    it('should call projectService.delete', async () => {
      jest.spyOn(projectService, 'delete');

      await projectController.deleteProject(mockRequestInstance, projectId);
      expect(projectService.delete).toHaveBeenCalled();
    });
  });

  describe('Project Environment Management', () => {
    describe('Add A Project Environment', () => {
      it('should call projectService.addEnvironment', async () => {
        jest.spyOn(projectService, 'addEnvironment');

        await projectController.addProjectEnvironment(
          mockRequestInstance,
          projectId,
          {
            address: mockProjectEnvironment.address,
            networkType: mockProjectEnvironment.networkType,
            webhookUrl: mockProjectEnvironment.webhookUrl,
          },
        );
        expect(projectService.addEnvironment).toHaveBeenCalled();
      });
    });

    describe('Find Project Environments', () => {
      it('should call projectService.findEnvironments', async () => {
        jest.spyOn(projectService, 'findEnvironments');

        await projectController.findProjectEnvironments(
          mockRequestInstance,
          projectId,
        );
        expect(projectService.findEnvironments).toHaveBeenCalled();
      });
    });

    describe('Find Project Environments', () => {
      const projectEnvironmentId = mockProjectEnvironment.id;

      it('should call projectService.removeEnvironment', async () => {
        jest.spyOn(projectService, 'removeEnvironment');

        await projectController.removeProjectEnvironment(
          mockRequestInstance,
          projectId,
          projectEnvironmentId,
        );
        expect(projectService.removeEnvironment).toHaveBeenCalled();
      });
    });
  });

  describe('Find Project Events', () => {
    it('should call projectService.findEvents', async () => {
      jest.spyOn(projectService, 'findEvents');

      await projectController.findProjectEvents(mockRequestInstance, projectId);
      expect(projectService.findEvents).toHaveBeenCalled();
    });
  });

  describe('Find Project Event Count', () => {
    it('should call projectService.findEventCount', async () => {
      jest.spyOn(projectService, 'findEventCount');

      await projectController.findProjectEventCount(
        mockRequestInstance,
        projectId,
      );
      expect(projectService.findEventCount).toHaveBeenCalled();
    });
  });
});
