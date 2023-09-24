import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options.interface';
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { RootService } from '../../../shared/classes/root-service/root-service';
import { Project } from '../entities/project.entity';
import {
  AddProjectEnvironmentInput,
  CreateProjectInput,
  UpdateProjectInput,
} from '../interfaces/project.interface';
import { PaginatedResult } from '../../../shared/interfaces/paginated-result.interface';
import { ProjectState } from '../enum/project.enum';
import { ProjectEnvironmentService } from '../../project-environment/services/project-environment.service';
import { ProjectEventService } from '../../project-event/services/project-event.service';

@Injectable()
export class ProjectService extends RootService<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @Inject(forwardRef(() => ProjectEnvironmentService))
    private readonly projectEnvironmentService: ProjectEnvironmentService,
    @Inject(forwardRef(() => ProjectEventService))
    private readonly projectEventService: ProjectEventService,
  ) {
    super(projectRepo);
  }

  async verify(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(
    input: CreateProjectInput,
    options: ServiceMethodOptions,
  ): Promise<Project> {
    const { currentUser } = options;

    return this.projectRepo.manager.transaction(async (entityManager) => {
      options = { ...options, entityManager };

      const parsedAbi = JSON.parse(input.abi);

      let project = this.constructEntityInstance(Project, {
        name: input.name,
        abi: parsedAbi,
        eventNames: input.eventNames,
        userId: currentUser.id,
      });

      project = await this.save(project, options);

      // Save the initial project environment
      await this.projectEnvironmentService.create(
        {
          networkType: input.networkType,
          address: input.address,
          projectId: project.id,
          webhookUrl: input.webhookUrl,
        },
        options,
      );

      return project;
    });
  }

  async update(
    id: string,
    input: UpdateProjectInput,
    options: ServiceMethodOptions,
  ): Promise<Project> {
    let project = await this.projectRepo.findOne({
      where: { id, userId: options.currentUser.id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const payload = { ...input };

    if (input.abi) {
      payload.abi = JSON.parse(input.abi);
    }

    project = await this.save({ ...project, ...input }, options);

    return project;
  }

  async findById(id: string): Promise<Project> {
    return this.projectRepo.findOne({
      where: { id },
    });
  }

  async find(options: ServiceMethodOptions): Promise<PaginatedResult<Project>> {
    const { currentUser, pagination } = options;

    let projectQuery = this.projectRepo
      .createQueryBuilder('project')
      .where({ userId: currentUser.id })
      .skip(pagination?.skip)
      .take(pagination?.take)
      .orderBy(`project.createdAt`, 'DESC')
      .leftJoinAndSelect('project.environments', 'environments');

    const [records, count] = await projectQuery.getManyAndCount();
    return { records, count };
  }

  async findOne(id: string, options: ServiceMethodOptions): Promise<Project> {
    let project = await this.projectRepo.findOne({
      where: { id, userId: options.currentUser.id },
      relations: ['environments'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async delete(id: string, options: ServiceMethodOptions): Promise<Project> {
    const project = await this.findOne(id, options);
    return this.save({ ...project, state: ProjectState.SHUTTING_DOWN });
  }

  async addEnvironment(
    id: string,
    input: AddProjectEnvironmentInput,
    options: ServiceMethodOptions,
  ) {
    const project = await this.findOne(id, options);

    return this.projectEnvironmentService.create(
      {
        ...input,
        projectId: project.id,
      },
      options,
    );
  }

  async findEnvironments(id: string, options: ServiceMethodOptions) {
    const project = await this.findOne(id, options);
    return this.projectEnvironmentService.findByProjectId(project.id);
  }

  async removeEnvironment(
    id: string,
    environmentId: string,
    options: ServiceMethodOptions,
  ) {
    await this.findOne(id, options);
    return this.projectEnvironmentService.delete(environmentId, options);
  }

  async findEvents(id: string, options: ServiceMethodOptions) {
    const project = await this.findOne(id, options);
    return this.projectEventService.find({
      ...options,
      query: { ...options.query, projectId: project.id },
    });
  }

  async findEventCount(id: string, options: ServiceMethodOptions) {
    const project = await this.findOne(id, options);
    const count = await this.projectEventService.count({
      ...options,
      query: { ...options.query, projectId: project.id },
    });
    return { count };
  }
}
