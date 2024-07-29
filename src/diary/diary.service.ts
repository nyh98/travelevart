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

  async getdiaries(customtravel_id: number, userId: number) {
    try{
      const diaries = await this.diaryRepository.find({
        where: { customTravel: { id: customtravel_id }, user: { id: userId } },
        relations: ['detailTravel'],
      });
  
      return {
        customtravel_id,
        details: diaries.map(diary => ({
          diary_id: diary.id,
          detailtravel_id: diary.detailTravel.id,
          contents: diary.contents,
          diary_time: diary.diary_time,
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
        diary_time: new Date(),
      });
      return this.diaryRepository.save(diary);
    }
    catch (error) {
      throw new InternalServerErrorException('일기 작성 실패');
    }
  }

  async modifydiary(
    customtravel_id: number,
    detailtravel_id: number,
    updateDiaryDto: UpdateDiaryDto,
    userId: number
  ): Promise<Diary> {
    try {
    const diary = await this.diaryRepository.findOne({
      where: {
        customTravel: { id: customtravel_id },
        detailTravel: { id: detailtravel_id },
        user: { id: userId }
      }
    });
    diary.contents = updateDiaryDto.contents;
    diary.diary_range = updateDiaryDto.diary_range;
    
    return this.diaryRepository.save(diary);
  }catch (error) {
    throw new InternalServerErrorException('일기 수정하기 실패');
  }
}

  async deletediary(
    customtravel_id: number,
    detailtravel_id: number,
    userId: number
  ){
    try {
    const diary = await this.diaryRepository.findOne({
      where: {
        customTravel: { id: customtravel_id },
        detailTravel: { id: detailtravel_id },
        user: { id: userId }
      }
    });
    await this.diaryRepository.delete(diary.id);
  }catch (error) {
    throw new InternalServerErrorException('일기 삭제하기 실패');
    }
  }
}
