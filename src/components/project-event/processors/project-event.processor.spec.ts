import { Test } from '@nestjs/testing';
import { ProjectEventService } from '../services/project-event.service';
import { ProjectEventProcessor } from './project-event.processor';
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
import { UserService } from '../../user/services/user.service';
import { mockBullJob, mockBullQueue } from '../../../../test/mocks/redis-mock';
import { getQueueToken } from '@nestjs/bull';

describe('Project Event Controller', () => {
  let projectEventProcessor: ProjectEventProcessor;
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
      controllers: [ProjectEventProcessor],
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

    projectEventProcessor = projectModule.get<ProjectEventProcessor>(
      ProjectEventProcessor,
    );

    projectEventService =
      projectModule.get<ProjectEventService>(ProjectEventService);
  });

  describe('Handle Poll Events', () => {
    it('should call projectEventService.pollEvents', async () => {
      jest.spyOn(projectEventService, 'pollEvents');

      await projectEventProcessor.pollEvents(mockBullJob);
      expect(projectEventService.pollEvents).toHaveBeenCalled();
    });
  });
});
