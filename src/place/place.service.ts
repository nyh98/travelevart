import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { FindOperator, Like, QueryFailedError, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { TourAPI, TourAPIDetail } from 'src/types/tourAPI';
import { RecommendationsDto, SearchPlaceDto } from './dto/search-place.dto';
import { PlaceRating } from './entities/placeRating.entity';
import { GptService } from 'src/gpt/gpt.service';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place) private placeRepository: Repository<Place>,
    private HttpService: HttpService,
    @InjectRepository(PlaceRating)
    private ratingRepository: Repository<PlaceRating>,
    private GptService: GptService,
  ) {}

  async getPlaces(searchOption: SearchPlaceDto) {
    const where: {
      regionId?: number;
      title?: FindOperator<string>;
      address?: FindOperator<string>;
    } = {};

    if (searchOption.regionCode) {
      where.regionId = searchOption.regionCode;
    }

    if (searchOption.district) {
      where.address = Like(`%${searchOption.district}%`);
    }

    if (searchOption.name) {
      where.title = Like(`%${searchOption.name}%`);
    }

    return this.placeRepository.findAndCount({
      select: ['placeId', 'address', 'image', 'title', 'mapx', 'mapy'],
      where: where,
      skip: (searchOption.page - 1) * searchOption.limit,
      take: searchOption.limit,
    });
  }

  async getPlaceDetail(placeId: string) {
    const isNumber = Number(placeId);

    if (!isNumber) {
      return null;
    }

    return this.placeRepository.findOne({
      select: ['placeId', 'address', 'image', 'title', 'descreiption'],
      where: { placeId: isNumber },
    });
  }

  async updatePlaceRating(
    placeId: number,
    userId: number,
    ratingValue: number,
  ) {
    if (!placeId) {
      throw new BadRequestException('id는 숫자여야 합니다');
    }

    const place = await this.placeRepository.findOne({
      where: { placeId: placeId },
    });

    if (!place) {
      throw new NotFoundException('여행지를 찾을 수 없습니다');
    }

    //기존에 여행지에 대한 별점을 준게 있는지 확인
    const rating = await this.ratingRepository.findOne({
      where: { placeId: place.placeId, userId },
    });

    try {
      //기존에 썻던 별점이 있으면 업데이트 없으면 새로 추가
      if (rating) {
        await this.ratingRepository.save({ ...rating, ratingValue });
      } else {
        const newRating = this.ratingRepository.create({
          placeId: place.placeId,
          userId,
          ratingValue,
        });
        await this.ratingRepository.save(newRating);
      }
    } catch (e) {
      if (e instanceof QueryFailedError && e.driverError.errno === 3819) {
        throw new BadRequestException('별점은 0~5점만 줄 수 있습니다');
      }

      throw new InternalServerErrorException('에러 발생 관리자에게 문의주세요');
    }
  }

  async deletePlaceRating(placeId: number, userId: number) {
    if (!placeId) {
      throw new BadRequestException('id는 숫자여야 합니다');
    }

    const rating = await this.ratingRepository.findOne({
      where: { placeId: placeId, userId },
    });

    if (!rating) {
      throw new NotFoundException('삭제할 별점이 없습니다');
    }

    await this.ratingRepository.delete(rating);
  }

  async recommendations(recommendationsDto: RecommendationsDto) {
    const { region1, region2, region3 } = recommendationsDto;

    const regions = [region1, region2, region3];

    const randomPlace: Place[] = [];

    const promise = regions.map(async (region) => {
      return this.placeRepository
        .createQueryBuilder('place')
        .select([
          'place.title, place.address, place.mapx, place.mapy, place.image',
        ])
        .where('place.regionId = :id', { id: region })
        .orderBy('RAND()')
        .limit(3)
        .getRawMany();
    });

    const result = await Promise.all(promise);

    result.forEach((places) => randomPlace.push(...places));
    return randomPlace;
  }
}
