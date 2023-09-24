export interface LogProjectEventInput {
  payload: any;
  projectId: string;
  environmentId: string;
  userId: string;
}

export interface QueueEventPollingJobInput {
  projectId: string;
  environmentId: string;
}
