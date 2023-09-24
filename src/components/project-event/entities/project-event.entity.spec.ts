import { ProjectEvent } from './project-event.entity';

describe('projectEvent Entity', () => {
  let projectEvent: ProjectEvent;

  beforeAll(() => {
    projectEvent = new ProjectEvent();
  });

  describe('When setCreatedAtDateOnly is called', () => {
    it('should set the projectEvent.createdAtDateOnly column to a date value', () => {
      projectEvent.setCreatedAtDateOnly();
      expect(projectEvent.createdAtDateOnly).toBeDefined();
    });
  });
});
