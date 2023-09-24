import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectService } from './services/project.service';
import { ProjectController } from './controllers/project.controller';
import { ProjectEnvironmentModule } from '../project-environment/project-environment.module';
import { ProjectEventModule } from '../project-event/project-event.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    forwardRef(() => ProjectEnvironmentModule),
    forwardRef(() => ProjectEventModule),
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService],
})
export class ProjectModule {}
