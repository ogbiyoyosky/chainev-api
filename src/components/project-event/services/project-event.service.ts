import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options.interface';
import { Repository } from 'typeorm';
import { RootService } from '../../../shared/classes/root-service/root-service';
import { ProjectEvent } from '../entities/project-event.entity';
import { QueueEventPollingJobInput } from '../interfaces/project-event.interface';
import { PaginatedResult } from '../../../shared/interfaces/paginated-result.interface';
import Web3 from 'web3';
import { ProjectEnvironmentNetworkType } from '../../project-environment/enum/project-environment.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ProjectEnvironmentService } from '../../project-environment/services/project-environment.service';
import { ProjectEnvironment } from '../../project-environment/entities/project-environment.entity';
import axios from 'axios';

@Injectable()
export class ProjectEventService extends RootService<ProjectEvent> {
  private readonly INFURIA_API_KEY = process.env.INFURIA_API_KEY;
  public readonly TESTNET_HTTP_URL = 'https://goerli.infura.io/v3';
  public readonly MAINNET_HTTP_URL = 'https://mainnet.infura.io/v3';
  public readonly TESTNET_WS_URL = 'wss://goerli.infura.io/ws/v3';
  public readonly MAINNET_WS_URL = 'wss://mainnet.infura.io/ws/v3';

  constructor(
    @InjectRepository(ProjectEvent)
    private readonly projectEventRepo: Repository<ProjectEvent>,
    @InjectQueue('PROJECT_EVENT')
    private readonly projectEventQueue: Queue,
    @Inject(forwardRef(() => ProjectEnvironmentService))
    private readonly projectEnvironmentService: ProjectEnvironmentService,
  ) {
    super(projectEventRepo);
  }

  async verify(id: string): Promise<ProjectEvent> {
    const event = await this.projectEventRepo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  resolveHTTPURL(networkType: ProjectEnvironmentNetworkType): string {
    const baseUrl =
      networkType === ProjectEnvironmentNetworkType.TESTNET
        ? this.TESTNET_HTTP_URL
        : this.MAINNET_HTTP_URL;

    return `${baseUrl}/${this.INFURIA_API_KEY}`;
  }

  resolveWsURL(networkType: ProjectEnvironmentNetworkType): string {
    const baseUrl =
      networkType === ProjectEnvironmentNetworkType.TESTNET
        ? this.TESTNET_WS_URL
        : this.MAINNET_WS_URL;

    return `${baseUrl}/${this.INFURIA_API_KEY}`;
  }

  async queuePollingJob(input: QueueEventPollingJobInput): Promise<void> {
    await this.projectEventQueue.add('polling-job', input, {
      repeat: { every: 10000 },
      jobId: input.environmentId,
    });
  }

  /**
   * Stop polling job by removing it from the queue using a specified jobId. The jobId is the id of an environment.
   * @param { string } jobId - The id of the associated environment
   */
  async deQueuePollingJob(jobId: string): Promise<void> {
    await this.projectEventQueue.removeRepeatable({
      every: 10000,
      jobId,
    });
  }

  buildFilter(query: any) {
    const filter = {};

    if (query.environmentId) {
      filter['environmentId'] = query.environmentId;
    }

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

  async findById(id: string): Promise<ProjectEvent> {
    return this.projectEventRepo.findOne({
      where: { id },
    });
  }

  async find(
    options: ServiceMethodOptions,
  ): Promise<PaginatedResult<ProjectEvent>> {
    const { currentUser, pagination, query } = options;
    const filter = this.buildFilter(query);

    let eventQuery = this.projectEventRepo
      .createQueryBuilder('event')
      .where({ ...filter, userId: currentUser.id })
      .orderBy(`"createdAt"`, 'DESC')
      .take(pagination.take)
      .skip(pagination.skip);

    const [records, count] = await eventQuery.getManyAndCount();
    return { records, count };
  }

  async findOne(
    id: string,
    options: ServiceMethodOptions,
  ): Promise<ProjectEvent> {
    let event = await this.projectEventRepo.findOne({
      where: { id, userId: options.currentUser.id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async getLastBlockNumber(
    networkType: ProjectEnvironmentNetworkType,
  ): Promise<number> {
    const infuraHttps = this.resolveHTTPURL(networkType);
    const web3 = new Web3(infuraHttps);
    const blockNumber = await web3.eth.getBlockNumber();
    return +blockNumber.toString();
  }

  async pollEvents(payload: any) {
    const environment = await this.projectEnvironmentService.findById(
      payload.environmentId,
    );



    if (!environment) return;

    const infuraHttps = this.resolveHTTPURL(environment.networkType);

    try {
      const web3 = new Web3(infuraHttps);
      const contractInstance = new web3.eth.Contract(
        environment.project.abi,
        environment.address,
      );


      environment.project.eventNames.map(async (eventName: string) => {
        try {
          let events: any[] = await contractInstance.getPastEvents(
            eventName,
            {
              fromBlock: BigInt(environment.lastRecordedBlockNumber + 1),
              // toBlock: BigInt(environment.lastRecordedBlockNumber + 2),
            },
            null,
          );
          console.log({events})

          if (events.length) {
            // Removing the first event with blockNumber equal to `environment.lastRecordedBlockNumber` because it has been previously logged to the database
            // events = events.slice(1);
            await this.logEvents(eventName, environment, events);
          }
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteByEnvironmentId(environmentId: string): Promise<void> {
    await this.projectEventRepo.delete({ environmentId });
  }

  resolveLatestBlockNumber(event: any) {
    let blockNumber: BigInt = event.blockNumber;
    return parseInt(blockNumber.toString());
  }

  async logEvents(
    eventName: string,
    environment: ProjectEnvironment,
    events: any[],
  ) {
    const lastEvent = events[events.length - 1];
    const latestBlockNumber = this.resolveLatestBlockNumber(lastEvent);

    if (environment.lastRecordedBlockNumber === latestBlockNumber) return;

    await this.projectEventRepo.manager.transaction(async (entityManager) => {
      const projectEvents = this.projectEventRepo.create(
        events.map((event) => {
          return {
            environmentId: environment.id,
            projectId: environment.projectId,
            userId: environment.userId,
            networkType: environment.networkType,
            payload: {
              eventName,
              data: this.toObject(event),
            },
          };
        }),
      );

      await this.pushHook(
        eventName,
        environment.webhookUrl,
        this.toObject(events),
      );

      await entityManager.save(projectEvents);
      await this.projectEnvironmentService.updateLastRecordedBlockNumber(
        environment,
        latestBlockNumber,
        { entityManager },
      );
    });
  }

  toObject(event: any) {
    return JSON.parse(
      JSON.stringify(
        event,
        (key, value) => (typeof value === 'bigint' ? +value.toString() : value), // return everything else unchanged
      ),
    );
  }

  async count(options: ServiceMethodOptions): Promise<number> {
    const { query, currentUser } = options;

    const filter = this.buildFilter({ ...query, userId: currentUser.id });

    return this.projectEventRepo.count({
      where: filter,
    });
  }

  async pushHook(eventName: string, url: string, data: any[]) {
    try {
      await axios.post(url, { eventName, data });
    } catch (error) {
      console.log(error);
    }
  }
}
