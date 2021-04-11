import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  title: string;

  content?: string;

  @IsNotEmpty()
  authorEmail: string;
}
