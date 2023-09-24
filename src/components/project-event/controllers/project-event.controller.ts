import {
  Controller,
  forwardRef,
  Get,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SuccessResponse } from '../../../shared/utils/response.utils';
import { JWTHTTPAuthGuard } from '../../../shared/guards/auth.guard';
import { ProjectEventService } from '../services/project-event.service';

@Controller('v1/project-events')
export class ProjectEventController {
  constructor(
    @Inject(forwardRef(() => ProjectEventService))
    private readonly projectEventService: ProjectEventService,
  ) {}

  @Get()
  @UseGuards(JWTHTTPAuthGuard)
  async findEvents(@Req() req: any) {
    const { currentUser, query, pagination } = req;
    const result = await this.projectEventService.find({
      currentUser,
      query,
      pagination,
    });

    return SuccessResponse('Query successful', result);
  }
}
