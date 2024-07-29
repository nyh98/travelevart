import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe, Query, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Request } from 'express';
import { CreateCommentDto } from './dto/createComment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 댓글 조회
  @Get(':postId')
  async getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    try {
      return this.commentService.getComments(postId, page);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 댓글 쓰기
  @Post(':postId')
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request
  ) {
    try {
      return await this.commentService.createComment(postId, createCommentDto.contents, req.user.id)
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 댓글 수정
  @Patch(':commentId')
  async modifyPost(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request
  ) {
    try {
      return await this.commentService.modifyComment(commentId, createCommentDto.contents, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 댓글 삭제
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request
  ) {
    try {
      return await this.commentService.deleteComment(commentId, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '삐용삐용 에러입니다. 모두 도망치세요!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
