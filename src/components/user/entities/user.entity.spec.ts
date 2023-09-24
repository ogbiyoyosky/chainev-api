import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeAll(() => {
    user = new User();
  });

  describe('When setCreatedAtDateOnly is called', () => {
    it('should set the user.createdAtDateOnly column to a date value', () => {
      user.setCreatedAtDateOnly();
      expect(user.createdAtDateOnly).toBeDefined();
    });
  });
});
