import { EntityManager, Repository } from 'typeorm';
import { MockType } from '../../../src/shared/interfaces/object-literal.interface';

export const entityManagerMockFactory = {
  findOne: jest.fn((entity) => entity),
  create: jest.fn((entity) => entity),
  findById: jest.fn((entity) => entity),
  update: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  delete: jest.fn((entity) => entity),
  transaction: () => jest.fn((entity) => entity),
};

// export const entityManagerMockFactory = jest.fn(() => new )
