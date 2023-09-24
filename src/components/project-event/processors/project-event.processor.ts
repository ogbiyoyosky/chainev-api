import { Process, Processor } from '@nestjs/bull';
import { ProjectEventService } from '../services/project-event.service';
import { Job } from 'bull';

@Processor('PROJECT_EVENT')
export class ProjectEventProcessor {
  constructor(private readonly rojectEventService: ProjectEventService) {}

  @Process('polling-job')
  async pollEvents(job: Job) {
    return this.rojectEventService.pollEvents(job.data);
  }
}
