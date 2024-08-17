// src/diary/diary.service.ts

import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diary } from './entities/diary.entity';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private diaryRepository: Repository<Diary>,
  ) {}

  async getdiaries(travelrouteId: number, userId: number) {
    try{
      const diaries = await this.diaryRepository.find({
        where: { travelRoute: { id: travelrouteId }, user: { id: userId } },
        relations: ['detailTravel'],
      });
  
      return {
        travelrouteId,
        details: diaries.map(diary => ({
          diaryId: diary.id,
          detailtravelId: diary.detailTravel.id,
          contents: diary.contents,
          diaryIime: diary.diaryTime,
        })),
      };
    }catch(error){
      throw new InternalServerErrorException('일기 조회 실패');
    }
  }

  async writediary(createDiaryDto: CreateDiaryDto, userId: number ): Promise<Diary> {
    try{
      const diary = this.diaryRepository.create({
        ...createDiaryDto,
        user: { id: userId },
        diaryTime: new Date(),
      });
      return this.diaryRepository.save(diary);
    }
    catch (error) {
      throw new InternalServerErrorException('일기 작성 실패');
    }
  }

  async modifydiary(
    travelrouteId: number,
    detailtravelId: number,
    updateDiaryDto: UpdateDiaryDto,
    userId: number
  ): Promise<Diary> {
    try {
    const diary = await this.diaryRepository.findOne({
      where: {
        travelRoute: { id: travelrouteId },
        detailTravel: { id: detailtravelId },
        user: { id: userId }
      }
    });
    diary.contents = updateDiaryDto.contents;
    diary.diaryRange = updateDiaryDto.diaryRange;
    
    return this.diaryRepository.save(diary);
  }catch (error) {
    throw new InternalServerErrorException('일기 수정하기 실패');
  }
}

  async deletediary(
    travelrouteId: number,
    detailtravelId: number,
    userId: number
  ){
    try {
    const diary = await this.diaryRepository.findOne({
      where: {
        travelRoute: { id: travelrouteId },
        detailTravel: { id: detailtravelId },
        user: { id: userId }
      }
    });
    await this.diaryRepository.delete(diary.id);
  }catch (error) {
    throw new InternalServerErrorException('일기 삭제하기 실패');
    }
  }
}
