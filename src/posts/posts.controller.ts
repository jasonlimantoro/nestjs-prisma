import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostModel } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  create(
    @Body()
    createPostDto: {
      title: string;
      content?: string;
      authorEmail: string;
    },
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

  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postsService.deletePost({ id: Number(id) });
  }
}
