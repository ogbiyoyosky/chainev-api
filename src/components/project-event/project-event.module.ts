import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEvent } from './entities/project-event.entity';
import { ProjectEventService } from './services/project-event.service';
import { BullModule } from '@nestjs/bull';
import { ProjectEventProcessor } from './processors/project-event.processor';
import { ProjectEventController } from './controllers/project-event.controller';
import { ProjectEnvironmentModule } from '../project-environment/project-environment.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEvent]),
    BullModule.registerQueue({ name: 'PROJECT_EVENT' }),
    forwardRef(() => ProjectEnvironmentModule),
  ],
  providers: [ProjectEventService, ProjectEventProcessor],
  controllers: [ProjectEventController],
  exports: [ProjectEventService],
})
export class ProjectEventModule {}
