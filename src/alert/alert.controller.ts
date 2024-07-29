import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Request } from 'express';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  async getAlert(
    @Req() req: Request
  ) {
    try {
      return await this.alertService.getAlert(req.user.id)
    } catch (error) {
      throw new HttpException(
        error.message || '알림 GET 컨트롤러 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch()
  async checkAlert(
    @Req() req: Request
  ) {
    try {
      return await this.alertService.checkAlert(req.user.id)
    } catch (error) {
      throw new HttpException(
        error.message || '알림 PATCH 컨트롤러 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
