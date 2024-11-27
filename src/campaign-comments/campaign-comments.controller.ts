
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { CampaignCommentsService } from './campaign-comments.service';
import { CreateCampaignCommentDto } from './dto/create-campaign-comment.dto';
import { UpdateCampaignCommentDto } from './dto/update-campaign-comment.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { HttpExceptionFilter } from 'src/common/error/http-exception.filter';
import { CreateCampaignReplyDto } from './dto/create-campaign-reply.dto';

@Controller('campaign-comments')
export class CampaignCommentsController {
  constructor(
    private readonly campaignCommentsService: CampaignCommentsService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @UseFilters(HttpExceptionFilter)
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createCampaignCommentDto: CreateCampaignCommentDto,
  ) {
    return await this.campaignCommentsService.create(
      userId,
      createCampaignCommentDto,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Post('reply')
  @UseFilters(HttpExceptionFilter)
  async createReply(
    @GetCurrentUserId() userId: string,
    @Body() createCampaignReplyDto: CreateCampaignReplyDto,
  ) {
    return await this.campaignCommentsService.createReply(
      userId,
      createCampaignReplyDto,
    );
  }

  @Get()
  findAll() {
    return this.campaignCommentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignCommentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignCommentDto: UpdateCampaignCommentDto,
  ) {
    return this.campaignCommentsService.update(+id, updateCampaignCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignCommentsService.remove(+id);
  }
}
