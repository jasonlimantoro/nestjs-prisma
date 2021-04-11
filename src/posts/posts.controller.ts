import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostModel } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get(':id')
  get(@Param('id') id: string): Promise<PostModel> {
    return this.postsService.find({ id: Number(id) });
  }

  @Post()
  create(
    @Body()
    createPostDto: CreatePostDto,
  ): Promise<PostModel> {
    const { title, content, authorEmail } = createPostDto;
    return this.postsService.create({
      title,
      content,
      author: {
        connect: {
          email: authorEmail,
        },
      },
    });
  }

  @Get('all/:searchString')
  async findAll(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postsService.findAll({
      where: {
        OR: [
          {
            title: {
              contains: searchString,
            },
          },
          {
            content: {
              contains: searchString,
            },
          },
        ],
      },
    });
  }

  @Patch(':id')
  async updateTitleOrContent(
    @Param('id') id: string,
    @Body() { title, content }: UpdatePostDto,
  ): Promise<PostModel> {
    return this.postsService.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        content,
      },
    });
  }

  @Patch('publish/:id')
  async publish(@Param('id') id: string): Promise<PostModel> {
    return this.postsService.update({
      where: {
        id: Number(id),
      },
      data: {
        published: true,
      },
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<PostModel> {
    return this.postsService.delete({ id: Number(id) });
  }
}
