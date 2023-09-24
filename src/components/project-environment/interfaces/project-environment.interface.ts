import { ProjectEnvironmentNetworkType } from '../enum/project-environment.enum';

export interface CreateProjectEnvironmentInput {
  networkType: ProjectEnvironmentNetworkType;
  address: string;
  webhookUrl: string;
  projectId: string;
}

export interface UpdateProjectEnvironmentInput {
  address?: string;
  webhookUrl?: string;
}
