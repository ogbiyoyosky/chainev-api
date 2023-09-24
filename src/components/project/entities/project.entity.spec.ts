import { Project } from './project.entity';

describe('project Entity', () => {
  let project: Project;

  beforeAll(() => {
    project = new Project();
  });

  describe('When setCreatedAtDateOnly is called', () => {
    it('should set the project.createdAtDateOnly column to a date value', () => {
      project.setCreatedAtDateOnly();
      expect(project.createdAtDateOnly).toBeDefined();
    });
  });
});
