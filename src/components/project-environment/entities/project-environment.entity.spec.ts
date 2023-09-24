import { ProjectEnvironment } from './project-environment.entity';

describe('projectEnvironment Entity', () => {
  let projectEnvironment: ProjectEnvironment;

  beforeAll(() => {
    projectEnvironment = new ProjectEnvironment();
  });

  describe('When setCreatedAtDateOnly is called', () => {
    it('should set the projectEnvironment.createdAtDateOnly column to a date value', () => {
      projectEnvironment.setCreatedAtDateOnly();
      expect(projectEnvironment.createdAtDateOnly).toBeDefined();
    });
  });
});
