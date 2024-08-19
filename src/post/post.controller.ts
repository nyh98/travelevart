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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { GetPostsDto, PostPostsDto } from './dto/post.dto';
import { PostService } from './post.service';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private S3Service: S3Service,
  ) {}

  // 게시글들 조회
  @Get()
  async getPosts(
    @Query() query: GetPostsDto,
    @Req() req:Request
  ) {
    try {
      const userId = req.user ? req.user.id : null;
      return await this.postService.getPosts(query, userId);
    } catch (error) {
      // 여기서 추가적인 로깅이나 에러 처리를 할 수 있습니다.
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 인기 게시글 조회
  @Get('/popular')
  async getPopularPosts(
    @Query('target') target:string,
    @Req() req:Request
  ) {
    try {
      const userId = req.user ? req.user.id : null;
      return await this.postService.getPopularPosts(target);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게시글 상세 조회
  @Get(':id')
  async getDetailPost(
    @Param('id', ParseIntPipe) id: number,
    @Req() req:Request
  ) {
    try {
      const userId = req.user ? req.user.id : null;
      return await this.postService.getDetailPost(id, userId);
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
  @UseInterceptors(FilesInterceptor('image'))
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() postPostsDto: PostPostsDto, 
    @Req() req: Request
  ) {
    try {
      if (typeof postPostsDto.contents === 'string') {
        postPostsDto.contents = JSON.parse(postPostsDto.contents);
      }
  
      if (typeof postPostsDto.travelRoute_id === 'string') {
        postPostsDto.travelRoute_id = parseInt(postPostsDto.travelRoute_id, 10);
      }

      if (postPostsDto.contents) {
        postPostsDto.contents = await Promise.all(postPostsDto.contents.map(async (content, index) => {          

          if (files && files[index]) {
            const file = files[index];
            
            // 파일이 실제로 존재하면 S3에 업로드
            if (file) {
              const imageUrl = await this.S3Service.uploadSingleFile(file); // 파일을 S3에 업로드
              content.image = imageUrl; // S3에서 반환된 URL을 image 필드에 설정
            }
          } else {
            console.log("파일이 없습니다.");
          }
          
          return content;
        }));
      } else {
        console.log("contents가 비어 있습니다.");
      }

      return await this.postService.createPost(postPostsDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게시글 수정
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('image'))
  async modifyPost(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[], 
    @Body() postPostsDto: PostPostsDto,
    @Req() req: Request
  ) {
    try {
      if (typeof postPostsDto.contents === 'string') {
        postPostsDto.contents = JSON.parse(postPostsDto.contents);
      }
  
      if (typeof postPostsDto.travelRoute_id === 'string') {
        postPostsDto.travelRoute_id = parseInt(postPostsDto.travelRoute_id, 10);
      }

      postPostsDto.post_id = id;

      // 기존 게시글의 이미지를 모두 삭제
      const existingContents = await this.postService.getPostContentsByPostId(id);
      for (const content of existingContents) {
        if (content.contents_img) {
          await this.S3Service.deleteFile(content.contents_img);
        }
      }
      
      // 
      if (postPostsDto.contents) {
        postPostsDto.contents = await Promise.all(postPostsDto.contents.map(async (content, index) => {
          const file = files[index];
          if (file) {
            const imageUrl = await this.S3Service.uploadSingleFile(file); // 파일을 S3에 업로드
            content.image = imageUrl; // S3에서 반환된 URL을 image 필드에 설정
          }
          return content;
        }));
      }

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
      // 기존 게시글의 이미지를 모두 삭제
      const existingContents = await this.postService.getPostContentsByPostId(id);
      for (const content of existingContents) {
        if (content.contents_img) {
          await this.S3Service.deleteFile(content.contents_img);
        }
      }
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
    @Req() req: Request
  ) {
    try {
      return await this.postService.likePost(post_id, req.user.id);
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
    @Req() req: Request
  ) {
    try {
      return await this.postService.unlikePost(post_id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}