import {
  mockProject,
  mockProjectEnvironment,
  mockProjectEvent,
  mockUser,
} from '../data';

export const userServiceMock = {
  create: jest.fn().mockImplementation(() => mockUser),
  findByEmail: jest.fn().mockImplementation(() => mockUser),
};

export const projectServiceMock = {
  create: jest.fn().mockImplementation(() => mockProject),
  find: jest.fn().mockImplementation(() => mockProject),
  findOne: jest.fn().mockImplementation(() => mockProject),
  update: jest.fn().mockImplementation(() => mockProject),
  delete: jest.fn().mockImplementation(() => null),
  addEnvironment: jest.fn(),
  findEnvironments: jest.fn(),
  removeEnvironment: jest.fn(),
  findEvents: jest.fn(),
  findEventCount: jest.fn(),
};

export const projectEnvironmentServiceMock = {
  create: jest.fn().mockImplementation(() => mockProjectEnvironment),
  findByProjectId: jest.fn().mockImplementation(() => mockProjectEnvironment),
  delete: jest.fn().mockImplementation(() => null),
};

export const projectEventServiceMock = {
  create: jest.fn().mockImplementation(() => mockProjectEvent),
  find: jest
    .fn()
    .mockImplementation(() => ({ count: 1, result: [mockProjectEvent] })),
  count: jest.fn().mockReturnValue(1),
  queuePollingJob: jest.fn(),
  deQueuePollingJob: jest.fn(),
  getLastBlockNumber: jest.fn().mockReturnValue(10000002),
  pollEvents: jest.fn(),
};
