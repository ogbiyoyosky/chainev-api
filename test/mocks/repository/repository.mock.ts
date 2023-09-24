export const entityManagerMockFactory = {
  findOne: jest.fn((entity) => entity),
  create: jest.fn((entity) => entity),
  findById: jest.fn((entity) => entity),
  update: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  delete: jest.fn((entity) => entity),
  transaction: jest.fn(),
};

export class SelectQueryBuilderMock {
  where(...args: any) {
    return this;
  }

  andWhere(...args: any) {
    return this;
  }

  skip(...args: any) {
    return this;
  }

  take(...args: any) {
    return this;
  }

  limit(...args: any) {
    return this;
  }

  orderBy(...args: any) {
    return this;
  }

  leftJoinAndSelect(...args: any) {
    return this;
  }

  async getManyAndCount() {
    const records = [];
    const count = 0;
    return [records, count];
  }
}

export const selectQueryBuilderMock = new SelectQueryBuilderMock();

export const repositoryMockFactory = jest.fn(() => ({
  findOne: jest.fn((entity) => entity),
  create: jest.fn((entity) => entity),
  find: jest.fn((entity) => []),
  findById: jest.fn((entity) => entity),
  findAndCount: jest.fn((entity) => []),
  update: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  delete: jest.fn((entity) => entity),
  count: jest.fn(),
  manager: entityManagerMockFactory,
  createQueryBuilder: jest.fn(() => new SelectQueryBuilderMock()),
}));
