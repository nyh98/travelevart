import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { GetPostsDto, PostPostsDto } from './dto/post.dto';
import { PostService } from './post.service';
import { Request } from 'express';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // 게시글들 조회
  @Get()
  async getPosts(@Query() query: GetPostsDto) {
    try {
      return await this.postService.getPosts(query);
    } catch (error) {
      // 여기서 추가적인 로깅이나 에러 처리를 할 수 있습니다.
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게시글 상세 조회
  @Get(':id')
  async getDetailPost(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.postService.getDetailPost(id);
    } catch (error) {
      // 여기서 추가적인 로깅이나 에러 처리를 할 수 있습니다.
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게시글 작성
  @Post()
  async createPost(@Body() postPostsDto: PostPostsDto, @Req() req: Request) {
    console.log(req.user);
    try {
      return await this.postService.createPost(postPostsDto);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게시글 수정
  @Patch(':id')
  async modifyPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() postPostsDto: PostPostsDto,
  ) {
    try {
      postPostsDto.post_id = id;
      return await this.postService.modifyPost(postPostsDto);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.postService.deletePost(id);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/likes')
  async likePost(
    @Param('id', ParseIntPipe) post_id: number,
    @Body('user_id', ParseIntPipe) user_id: number,
  ) {
    try {
      return await this.postService.likePost(post_id, user_id);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id/likes')
  async unlikePost(
    @Param('id', ParseIntPipe) post_id: number,
    @Body('user_id', ParseIntPipe) user_id: number,
  ) {
    try {
      return await this.postService.unlikePost(post_id, user_id);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
