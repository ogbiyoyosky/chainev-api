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
import { ProjectEnvironment } from '../entities/project-environment.entity';
import {
  CreateProjectEnvironmentInput,
  UpdateProjectEnvironmentInput,
} from '../interfaces/project-environment.interface';
import { PaginatedResult } from '../../../shared/interfaces/paginated-result.interface';
import { ProjectEnvironmentNetworkType } from '../enum/project-environment.enum';
import { ProjectEventService } from '../../project-event/services/project-event.service';

@Injectable()
export class ProjectEnvironmentService extends RootService<ProjectEnvironment> {
  constructor(
    @InjectRepository(ProjectEnvironment)
    private readonly projectEnvironmentRepo: Repository<ProjectEnvironment>,
    @Inject(forwardRef(() => ProjectEventService))
    private readonly projectEventService: ProjectEventService,
  ) {
    super(projectEnvironmentRepo);
  }

  async verify(id: string): Promise<ProjectEnvironment> {
    const project = await this.projectEnvironmentRepo.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Project environment not found');
    }
    return project;
  }

  async checkDuplicateProjectEnvironment(
    networkType: ProjectEnvironmentNetworkType,
    projectId: string,
  ): Promise<void> {
    const environment = await this.projectEnvironmentRepo.findOne({
      where: { networkType, projectId },
    });

    if (environment) {
      throw new BadRequestException(
        `You already have your ${environment.networkType.toLowerCase()} environment set up`,
      );
    }
  }

  async create(
    input: CreateProjectEnvironmentInput,
    options: ServiceMethodOptions,
  ): Promise<ProjectEnvironment> {
    const { currentUser } = options;

    await this.checkDuplicateProjectEnvironment(
      input.networkType,
      input.projectId,
    );

    const lastBlockNumber = await this.projectEventService.getLastBlockNumber(
      input.networkType,
    );

    let environment = this.constructEntityInstance(ProjectEnvironment, {
      networkType: input.networkType,
      address: input.address,
      webhookUrl: input.webhookUrl,
      projectId: input.projectId,
      userId: currentUser.id,
      lastRecordedBlockNumber: lastBlockNumber,
    });

    environment = await this.save(environment, options);

    await this.projectEventService.queuePollingJob({
      projectId: input.projectId,
      environmentId: environment.id,
    });

    return environment;
  }

  async update(
    id: string,
    input: UpdateProjectEnvironmentInput,
    options: ServiceMethodOptions,
  ): Promise<ProjectEnvironment> {
    let environment = await this.projectEnvironmentRepo.findOne({
      where: { id, userId: options.currentUser.id },
    });

    if (!environment) {
      throw new NotFoundException('Project environment not found');
    }

    return this.save({ ...environment, ...input }, options);
  }

  buildFilter(query: any) {
    const filter: any = {};

    if (query.networkType) {
      filter['networkType'] = query.networkType;
    }

    if (query.projectId) {
      filter['projectId'] = query.projectId;
    }

    if (query.userId) {
      filter['userId'] = query.userId;
    }

    return filter;
  }

  buildSearchQuery(
    selectQueryBuilder: SelectQueryBuilder<ProjectEnvironment>,
    searchTerm: string,
  ): SelectQueryBuilder<ProjectEnvironment> {
    if (searchTerm) {
      let splittedTerms = searchTerm.split(' ');
      const rejoinedTerms = splittedTerms.join(' | ');

      selectQueryBuilder.andWhere(`
          to_tsvector(
            environment.name || ' ' || 
            environment.createdAt || ' ' 
          ) 
          @@ to_tsquery('${rejoinedTerms}')
        `);
    }

    return selectQueryBuilder;
  }

  async findById(id: string): Promise<ProjectEnvironment> {
    return this.projectEnvironmentRepo.findOne({
      where: { id },
      relations: ['project'],
    });
  }

  async findByProjectId(projectId: string): Promise<ProjectEnvironment[]> {
    return this.projectEnvironmentRepo.find({
      where: { projectId },
    });
  }

  async find(
    options: ServiceMethodOptions,
  ): Promise<PaginatedResult<ProjectEnvironment>> {
    const { currentUser, pagination, query } = options;
    const filter = this.buildFilter(query);

    let projectEnvironmentQuery = this.projectEnvironmentRepo
      .createQueryBuilder('environment')
      .where({ ...filter, userId: currentUser.id })
      .orderBy(`"createdAt"`, 'DESC')
      .limit(pagination.take)
      .skip(pagination.skip);

    projectEnvironmentQuery = this.buildSearchQuery(
      projectEnvironmentQuery,
      query.q,
    );

    const [records, count] = await projectEnvironmentQuery.getManyAndCount();
    return { records, count };
  }

  async findOne(
    id: string,
    options: ServiceMethodOptions,
  ): Promise<ProjectEnvironment> {
    let environment = await this.projectEnvironmentRepo.findOne({
      where: { id, userId: options.currentUser.id },
    });

    if (!environment) {
      throw new NotFoundException('Project environment not found');
    }

    return environment;
  }

  async delete(id: string, options: ServiceMethodOptions): Promise<void> {
    let environment = await this.projectEnvironmentRepo.findOne({
      where: { id, userId: options.currentUser.id },
    });

    if (!environment) {
      throw new NotFoundException('Project environment not found');
    }

    // Queue the shutdown and deletion process,
    await this.projectEventService.deQueuePollingJob(id);

    // Update environment state to shutting down.
    // return this.save({
    //   ...environment,
    //   state: ProjectEnvironmentState.SHUTTING_DOWN,
    // });
    await this.projectEnvironmentRepo.delete({ id });
  }

  async updateLastRecordedBlockNumber(
    environment: ProjectEnvironment,
    lastRecordedBlockNumber: number,
    options: ServiceMethodOptions,
  ): Promise<ProjectEnvironment> {
    return this.save({ ...environment, lastRecordedBlockNumber }, options);
  }
}
