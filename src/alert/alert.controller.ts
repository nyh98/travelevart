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
        error.message || '알림 호출에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteAlert(
    @Param('id') id: number,
    @Req() req: Request
  ) {
    try {
      return this.alertService.deleteAlert(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '알림 개별 삭제 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  async deleteAllAlerts(
    @Req() req: Request
  ) {
    try {
      return this.alertService.deleteAllAlerts(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '알림 전체 삭제',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
