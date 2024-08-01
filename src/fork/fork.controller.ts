import { Controller, Post, Body, Param, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { ForkService } from './fork.service';
import { Request, Response } from 'express';

@Controller('customs')
export class ForkController {
  constructor(private readonly forkService: ForkService) {}

  @Post(':postId')
  async forkPost(
    @Param('postId') postId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const fork = await this.forkService.forkPost(req.user.id, postId);
      return res.status(HttpStatus.CREATED).json(fork);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }
}
