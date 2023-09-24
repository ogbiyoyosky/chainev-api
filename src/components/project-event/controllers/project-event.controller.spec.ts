import { Test } from '@nestjs/testing';
import { ProjectEventService } from '../services/project-event.service';
import { ProjectEventController } from './project-event.controller';
import { repositoryMockFactory } from '../../../../test/mocks/repository/repository.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectEvent } from '../entities/project-event.entity';
import { ProjectEnvironmentService } from '../../project-environment/services/project-environment.service';
import { ProjectService } from '../../project/services/project.service';
import {
  projectEnvironmentServiceMock,
  projectEventServiceMock,
  projectServiceMock,
  userServiceMock,
} from '../../../../test/mocks/services';
import { mockRequestInstance } from '../../../../test/mocks/data';
import { UserService } from '../../user/services/user.service';
import { getQueueToken } from '@nestjs/bull';
import { mockBullQueue } from '../../../../test/mocks/redis-mock';

describe('Project Event Controller', () => {
  let projectEventController: ProjectEventController;
  let projectEventService: ProjectEventService;

  beforeEach(async () => {
    const projectModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ProjectEvent),
          useValue: repositoryMockFactory,
        },
        ProjectService,
        ProjectEnvironmentService,
        ProjectEventService,
        UserService,
        {
          provide: getQueueToken('PROJECT_EVENT'),
          useValue: mockBullQueue,
        },
      ],
      controllers: [ProjectEventController],
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

    projectEventController = projectModule.get<ProjectEventController>(
      ProjectEventController,
    );

    projectEventService =
      projectModule.get<ProjectEventService>(ProjectEventService);
  });

  describe('Find Project Events', () => {
    it('should call projectEventService.find', async () => {
      jest.spyOn(projectEventService, 'find');

      await projectEventController.findEvents(mockRequestInstance);
      expect(projectEventService.find).toHaveBeenCalled();
    });
  });
});
