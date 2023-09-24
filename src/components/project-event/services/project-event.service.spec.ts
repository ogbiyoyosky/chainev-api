import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../../../test/mocks/repository/repository.mock';
import { Repository } from 'typeorm';
import {
  mockProjectEnvironment,
  mockUser,
  mockProjectEvent,
  mockBlockchainEvent,
  mockProject,
} from '../../../../test/mocks/data';
import { ProjectEventService } from './project-event.service';
import { ProjectEnvironmentService } from '../../project-environment/services/project-environment.service';

import { User } from '../../user/entities/user.entity';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options.interface';
import {
  projectEnvironmentServiceMock,
  projectServiceMock,
  userServiceMock,
} from '../../../../test/mocks/services';
import { ProjectEnvironment } from '../../project-environment/entities/project-environment.entity';
import { ProjectEnvironmentNetworkType } from '../../project-environment/enum/project-environment.enum';
import { ProjectEvent } from '../entities/project-event.entity';
import { ProjectService } from '../../project/services/project.service';
import { UserService } from '../../user/services/user.service';
import { getQueueToken } from '@nestjs/bull';
import { mockBullQueue } from '../../../../test/mocks/redis-mock';
import Web3 from 'web3';
import { entityManagerMockFactory } from '../../../../test/mocks/connection/entity-manager.mock';
import axios from 'axios';

describe('ProjectEventService', () => {
  let projectEventService: ProjectEventService;
  let repositoryMock: Repository<ProjectEvent>;
  let projectEnvironmentService: ProjectEnvironmentService;
  let options: ServiceMethodOptions;

  beforeEach(async () => {
    options = {
      currentUser: mockUser as User,
      pagination: { skip: 0, take: 10 },
    };

    const userModule: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ProjectEvent),
          useFactory: repositoryMockFactory,
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
    })
      .overrideProvider(ProjectService)
      .useValue(projectServiceMock)
      .overrideProvider(ProjectEnvironmentService)
      .useValue(projectEnvironmentServiceMock)
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();

    repositoryMock = userModule.get(getRepositoryToken(ProjectEvent));
    projectEnvironmentService = userModule.get<ProjectEnvironmentService>(
      ProjectEnvironmentService,
    );
    projectEventService =
      userModule.get<ProjectEventService>(ProjectEventService);
  });

  describe('Chain HTTP URL Resolution', () => {
    describe('When the network type is TESTNET', () => {
      it('should return a url starting with the testnet HTTP', () => {
        const networkType = ProjectEnvironmentNetworkType.TESTNET;
        const expected = projectEventService.TESTNET_HTTP_URL;

        const actual = projectEventService.resolveHTTPURL(networkType);

        expect(actual.startsWith(expected)).toBe(true);
      });
    });

    describe('When the network type is MAINNET', () => {
      it('should return a url starting with the mainnet HTTP', () => {
        const networkType = ProjectEnvironmentNetworkType.MAINNET;
        const expected = projectEventService.MAINNET_HTTP_URL;

        const actual = projectEventService.resolveHTTPURL(networkType);

        expect(actual.startsWith(expected)).toBe(true);
      });
    });
  });

  describe('Chain Websocket URL Resolution', () => {
    describe('When the network type is TESTNET', () => {
      it('should return a url starting with the testnet WS', () => {
        const networkType = ProjectEnvironmentNetworkType.TESTNET;
        const expected = projectEventService.TESTNET_WS_URL;

        const actual = projectEventService.resolveWsURL(networkType);

        expect(actual.startsWith(expected)).toBe(true);
      });
    });

    describe('When the network type is MAINNET', () => {
      it('should return a url starting with the mainnet WS', () => {
        const networkType = ProjectEnvironmentNetworkType.MAINNET;
        const expected = projectEventService.MAINNET_WS_URL;

        const actual = projectEventService.resolveWsURL(networkType);

        expect(actual.startsWith(expected)).toBe(true);
      });
    });
  });

  describe('Queue Polling Job', () => {
    it('should call the projectEventQueue.add method', async () => {
      const queueAddMethodSpy = jest.spyOn(mockBullQueue, 'add');

      await projectEventService.queuePollingJob({
        projectId: mockProjectEnvironment.projectId,
        environmentId: mockProjectEnvironment.id,
      });

      expect(queueAddMethodSpy).toHaveBeenCalled();
    });
  });

  describe('DeQueue Polling Job', () => {
    it('should call the projectEventQueue.removeRepeatable method', async () => {
      const removeRepeatableMethodSpy = jest.spyOn(
        mockBullQueue,
        'removeRepeatable',
      );

      await projectEventService.deQueuePollingJob(mockProjectEnvironment.id);

      expect(removeRepeatableMethodSpy).toHaveBeenCalled();
    });
  });

  describe('Build Filter', () => {
    let queryObject: object;

    beforeEach(() => {
      queryObject = {};
    });

    it('should return an empty object literal if input object is empty', () => {
      const actual = projectEventService.buildFilter(queryObject);
      expect(actual).toEqual({});
    });

    it('should return filter object with a environmentId property', () => {
      queryObject = { environmentId: mockProjectEnvironment.id };

      const actual = projectEventService.buildFilter(queryObject);

      expect(actual).toHaveProperty('environmentId');
    });

    it('should return filter object with a networkType property', () => {
      queryObject = { networkType: ProjectEnvironmentNetworkType.MAINNET };

      const actual = projectEventService.buildFilter(queryObject);

      expect(actual).toHaveProperty('networkType');
    });

    it('should return filter object with a projectId property', () => {
      queryObject = { projectId: mockProjectEvent.projectId };

      const actual = projectEventService.buildFilter(queryObject);

      expect(actual).toHaveProperty('projectId');
    });

    it('should return filter object with a userId property', () => {
      queryObject = { userId: mockProjectEvent.userId };

      const actual = projectEventService.buildFilter(queryObject);

      expect(actual).toHaveProperty('userId');
    });
  });

  describe('Verify method', () => {
    describe('when project event can be found', () => {
      it('should return project event', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() =>
            Promise.resolve(mockProjectEvent as ProjectEvent),
          );

        const actual = await projectEventService.verify(mockProjectEvent.id);

        expect(actual).toBeDefined();
        expect(actual.networkType).toBe(mockProjectEvent.networkType);
      });
    });

    describe('when project event can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await projectEventService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('Event not found');
        }
      });
    });
  });

  describe('Find By Id', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementation(() =>
          Promise.resolve(mockProjectEvent as ProjectEvent),
        );

      const actual = await projectEventService.findById(mockProjectEvent.id);

      expect(finOneSpy).toHaveBeenCalled();
      expect(actual).toEqual(mockProjectEvent);
    });
  });

  describe('Find All Project Events', () => {
    it('should call repository.findOne', async () => {
      const createQueryBuilderSpy = jest.spyOn(
        repositoryMock,
        'createQueryBuilder',
      );

      await projectEventService.find({ ...options, query: {} });
      expect(createQueryBuilderSpy).toHaveBeenCalled();
    });
  });

  describe('Find One', () => {
    it('should call repository.findOne', async () => {
      const finOneSpy = jest.spyOn(repositoryMock, 'findOne');

      await projectEventService.findOne(mockProjectEvent.id, options);

      expect(finOneSpy).toHaveBeenCalled();
    });

    describe('when project event can be found', () => {
      it('should return project event', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() =>
            Promise.resolve(mockProjectEvent as ProjectEvent),
          );

        const actual = await projectEventService.verify(mockProjectEvent.id);

        expect(actual).toBeDefined();
        expect(actual.networkType).toBe(mockProjectEvent.networkType);
      });
    });

    describe('when project event can not be found', () => {
      it('should throw a not found error', async () => {
        jest
          .spyOn(repositoryMock, 'findOne')
          .mockImplementation(() => Promise.resolve(null));

        try {
          await projectEventService.verify(mockUser.id);
        } catch (error) {
          expect(error.message).toBe('Event not found');
        }
      });
    });
  });

  describe('Delete Project Event By Project Environment Id', () => {
    it('should should call the projectEnvironmentRepo.delete', async () => {
      let projectId = mockProjectEvent.id;
      const deleteMethodSpy = jest.spyOn(repositoryMock, 'delete');

      await projectEventService.deleteByEnvironmentId(projectId);
      expect(deleteMethodSpy).toHaveBeenCalled();
    });
  });

  describe('Get Last Recorded Block Number', () => {
    it('it should return last block number', async () => {
      const expectedType = 'number';
      const url = projectEventService.resolveHTTPURL(
        mockProjectEnvironment.networkType,
      );

      const web3 = new Web3(url);
      web3.eth.getBlockNumber = jest.fn().mockImplementation(() => 100000);

      const actual = await projectEventService.getLastBlockNumber(
        mockProjectEnvironment.networkType,
      );

      expect(typeof actual).toBe(expectedType);
    }, 10000);
  });

  describe('Poll Event Handler', () => {
    it.todo('Test event polling');
  });

  describe('Resolve Lastest Block Number', () => {
    it('should convert a BigInt to a Number object', () => {
      const expected = parseInt(mockBlockchainEvent.blockNumber.toString());

      const actual =
        projectEventService.resolveLatestBlockNumber(mockBlockchainEvent);

      expect(actual).toBe(expected);
    });
  });

  describe('Log Events In Database', () => {
    describe('When last recorded block number is the same as latest block number', () => {
      it('should do nothing', async () => {
        mockProjectEnvironment.lastRecordedBlockNumber =
          projectEventService.resolveLatestBlockNumber(mockBlockchainEvent);

        const transactionSpy = jest.spyOn(
          entityManagerMockFactory,
          'transaction',
        );

        await projectEventService.logEvents(
          mockProject.eventNames[0],
          mockProjectEnvironment as ProjectEnvironment,
          [mockBlockchainEvent],
        );

        expect(transactionSpy).not.toHaveBeenCalled();
      });
    });

    describe('When last recorded block number is not the same as latest block number', () => {
      xit('should log the blockchain events', async () => {
        const transactionSpy = jest.spyOn(
          repositoryMock.manager,
          'transaction',
        );

        await projectEventService.logEvents(
          mockProject.eventNames[0],
          mockProjectEnvironment as ProjectEnvironment,
          [mockBlockchainEvent],
        );

        expect(transactionSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Convert To Object', () => {
    it('should bigint values in a object to regular number', () => {
      const obj = {
        biggy: BigInt('9999999999999999'),
        name: 'Steve',
      };

      const expectedType = 'number';

      const actual = projectEventService.toObject(obj);

      expect(typeof actual.biggy).toBe(expectedType);
    });
  });

  describe('Count Events', () => {
    it('should call repository.count', async () => {
      const countSpy = jest.spyOn(repositoryMock, 'count');

      await projectEventService.count({ ...options, query: {} });

      expect(countSpy).toHaveBeenCalled();
    });
  });

  describe('Push an event to webhook url', () => {
    it('should call repository.count', async () => {
      const axiosPostMethodSpy = jest
        .spyOn(axios, 'post')
        .mockImplementation(() => Promise.resolve({}));

      await projectEventService.pushHook(
        mockProject.eventNames[0],
        mockProjectEnvironment.webhookUrl,
        [mockBlockchainEvent],
      );

      expect(axiosPostMethodSpy).toHaveBeenCalled();
    });
  });
});
