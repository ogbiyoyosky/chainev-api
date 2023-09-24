import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SuccessResponse } from '../../../shared/utils/response.utils';
import { JWTHTTPAuthGuard } from '../../../shared/guards/auth.guard';
import { ProjectService } from '../services/project.service';
import {
  AddProjectEnvironmentDto,
  CreateProjectDto,
  UpdateProjectDto,
} from '../dto/project.dto';

@Controller('v1/projects')
export class ProjectController {
  constructor(
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  @Post()
  @UseGuards(JWTHTTPAuthGuard)
  async createProject(@Req() req: any, @Body() body: CreateProjectDto) {
    const { currentUser } = req;
    const project = await this.projectService.create(body, { currentUser });
    return SuccessResponse('Project was created successfully', project);
  }

  @Get()
  @UseGuards(JWTHTTPAuthGuard)
  async findProjects(@Req() req: any) {
    const { currentUser, query, pagination } = req;
    const result = await this.projectService.find({
      currentUser,
      query,
      pagination,
    });

    return SuccessResponse('Query successful', result);
  }

  @Get(':id')
  @UseGuards(JWTHTTPAuthGuard)
  async findProject(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const { currentUser } = req;
    const project = await this.projectService.findOne(id, { currentUser });
    return SuccessResponse('Query successfully', project);
  }

  @Patch(':id')
  @UseGuards(JWTHTTPAuthGuard)
  async updateProject(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProjectDto,
  ) {
    const { currentUser } = req;
    const project = await this.projectService.update(id, body, { currentUser });
    return SuccessResponse('Project was updated successfully', project);
  }

  @Delete(':id')
  @UseGuards(JWTHTTPAuthGuard)
  async deleteProject(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const { currentUser } = req;
    const project = await this.projectService.delete(id, { currentUser });
    return SuccessResponse('Project is being deleted', project);
  }

  @Post(':id/environments')
  @UseGuards(JWTHTTPAuthGuard)
  async addProjectEnvironment(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AddProjectEnvironmentDto,
  ) {
    const { currentUser } = req;
    const environment = await this.projectService.addEnvironment(id, body, {
      currentUser,
    });
    return SuccessResponse('Environment added successfully', environment);
  }

  @Get(':id/environments')
  @UseGuards(JWTHTTPAuthGuard)
  async findProjectEnvironments(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { currentUser } = req;
    const environments = await this.projectService.findEnvironments(id, {
      currentUser,
    });
    return SuccessResponse('Query successfully', environments);
  }

  @Delete(':id/environments/:environmentId')
  @UseGuards(JWTHTTPAuthGuard)
  async removeProjectEnvironment(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('environmentId', ParseUUIDPipe) environmentId: string,
  ) {
    const { currentUser } = req;
    await this.projectService.removeEnvironment(id, environmentId, {
      currentUser,
    });
    return SuccessResponse('Environment removed successfully');
  }

  @Get(':id/events')
  @UseGuards(JWTHTTPAuthGuard)
  async findProjectEvents(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { currentUser, pagination, query } = req;
    const events = await this.projectService.findEvents(id, {
      currentUser,
      pagination,
      query,
    });
    return SuccessResponse('Query successfully', events);
  }

  @Get(':id/event-count')
  @UseGuards(JWTHTTPAuthGuard)
  async findProjectEventCount(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { currentUser, pagination, query } = req;
    const result = await this.projectService.findEventCount(id, {
      currentUser,
      pagination,
      query,
    });
    return SuccessResponse('Query successfully', result);
  }
}
