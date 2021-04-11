import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as IPost } from './interfaces/post.interface';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    this.postsService.create(createPostDto);
  }

  @Get()
  async findAll(): Promise<IPost[]> {
    return this.postsService.findAll();
  }
}
