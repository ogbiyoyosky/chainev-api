import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEnvironment } from './entities/project-environment.entity';
import { ProjectEnvironmentService } from './services/project-environment.service';
import { ProjectEventModule } from '../project-event/project-event.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEnvironment]),
    forwardRef(() => ProjectEventModule),
  ],
  providers: [ProjectEnvironmentService],
  exports: [ProjectEnvironmentService],
})
export class ProjectEnvironmentModule {}
