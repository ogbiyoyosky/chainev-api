import { ProjectEnvironmentNetworkType } from '../../project-environment/enum/project-environment.enum';

export interface CreateProjectInput {
  name: string;
  networkType: ProjectEnvironmentNetworkType;
  address: string;
  abi: any;
  eventNames: string[];
  webhookUrl?: string;
}

export interface UpdateProjectInput {
  name?: string;
  abi?: any;
  eventNames?: string[];
}

export interface AddProjectEnvironmentInput {
  networkType: ProjectEnvironmentNetworkType;
  address: string;
  webhookUrl: string;
}
