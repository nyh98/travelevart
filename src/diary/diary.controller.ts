import { Controller, Post, Patch, Delete, Body, Param, Req, HttpException, HttpStatus, ParseIntPipe, Query, Get } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { Request } from 'express';

@Controller('diaries')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get(':travelrouteId')
  async getDiaries(
    @Param('travelrouteId', ParseIntPipe) travelrouteId: number,
    @Req() req: Request
  ) {
    try {
      return await this.diaryService.getdiaries(travelrouteId, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '서버 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async writediary(@Body() createDiaryDto: CreateDiaryDto, @Req() req: Request) {
    try {
      return await this.diaryService.writediary(createDiaryDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || '서버 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch()
  async modifydiary(
    @Query('travelrouteId') travelrouteId: number,
    @Query('detailtravelId') detailtravelId: number,
    @Body() updateDiaryDto: UpdateDiaryDto,
    @Req() req: Request
  ) {
    try {
      return await this.diaryService.modifydiary(
        travelrouteId,
        detailtravelId,
        updateDiaryDto,
        req.user.id
      );
    } catch (error) {
      throw new HttpException(
        error.message || '서버 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  async deletediary(
    @Query('travelrouteId') travelrouteId: number,
    @Query('detailtravelId') detailtravelId: number,
    @Body() updateDiaryDto: UpdateDiaryDto,
    @Req() req: Request
  ) {
    try {
      return await this.diaryService.deletediary(
        travelrouteId,
        detailtravelId,
        req.user.id
      );
    } catch (error) {
      throw new HttpException(
        error.message || '서버 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
