export enum ProjectState {
  STARTING_UP = 'STARTING_UP', // Project is just being started up with the initial environment being set
  ACTIVE = 'ACTIVE', // Project is actively running fine
  SHUTTING_DOWN = 'SHUTTING_DOWN', // Project event listeners and environments are being deleted
  DELETING = 'DELETING', // Project is being deleted
}
