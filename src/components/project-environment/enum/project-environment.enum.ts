export enum ProjectEnvironmentState {
  STARTING_UP = 'STARTING_UP', // Project environment is just being started up with the initial environment being set
  ACTIVE = 'ACTIVE', // Project environment is actively running fine
  SHUTTING_DOWN = 'SHUTTING_DOWN', // Project environment event listeners and environments are being deleted
  DELETING = 'DELETING', // Project environment is being deleted
}

export enum ProjectEnvironmentNetworkType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}
