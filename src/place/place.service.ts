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
import {
  PaginationDto,
  RecommendationsDto,
  SearchPlaceDto,
} from './dto/search-place.dto';
import { PlaceRating } from './entities/placeRating.entity';
import { GptService } from 'src/gpt/gpt.service';
import { Region } from './entities/region.entity';
import { CreateOrUpdateRatingDto } from './dto/create-place.dto';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place) private placeRepository: Repository<Place>,
    private HttpService: HttpService,
    @InjectRepository(PlaceRating)
    private ratingRepository: Repository<PlaceRating>,
    private GptService: GptService,
    @InjectRepository(Region) private regionRepository: Repository<Region>,
    private cartService: CartService,
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
      select: ['id', 'address', 'image', 'title', 'mapx', 'mapy'],
      where: where,
      skip: (searchOption.page - 1) * searchOption.limit,
      take: searchOption.limit,
    });
  }

  async getPlaceDetail(placeId: number, userId?: number) {
    console.log(userId);
    if (isNaN(placeId)) {
      throw new BadRequestException('id는 숫자여야 합니다');
    }

    const place = await this.placeRepository.findOne({
      select: [
        'id',
        'address',
        'image',
        'title',
        'descreiption',
        'viewCount',
        'mapx',
        'mapy',
      ],
      where: { id: placeId },
    });

    if (place) {
      this.placeRepository.save({ ...place, viewCount: place.viewCount + 1 });
    }

    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.ratingValue) AS average')
      .where('rating.placeId = :id', { id: placeId })
      .getRawOne();

    const numberAverage = Number(Number(result.average).toFixed(1));

    const totalSaveCount = await this.cartService.getTotalSaveCount(placeId);

    let isSaved: boolean;
    if (userId) {
      const result = await this.cartService.isSaved(userId, placeId);
      console.log(result);
      isSaved = Boolean(result);
    } else {
      isSaved = false;
    }

    return { place, average: numberAverage, totalSaveCount, isSaved };
  }

  async updatePlaceRating(
    placeId: number,
    userId: number,
    ratingData: CreateOrUpdateRatingDto,
  ) {
    if (!placeId) {
      throw new BadRequestException('id는 숫자여야 합니다');
    }

    const place = await this.placeRepository.findOne({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('여행지를 찾을 수 없습니다');
    }

    //기존에 여행지에 대한 별점을 준게 있는지 확인
    const rating = await this.ratingRepository.findOne({
      where: { placeId: place.id, userId },
    });

    try {
      //기존에 썻던 별점이 있으면 업데이트 없으면 새로 추가
      if (rating) {
        await this.ratingRepository.save({
          ...rating,
          ratingValue: ratingData.ratingValue,
          review: ratingData.review,
        });
      } else {
        const newRating = this.ratingRepository.create({
          placeId: place.id,
          userId,
          ratingValue: ratingData.ratingValue,
          review: ratingData.review,
          createdAt: new Date(),
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

    const millisecond =
      new Date(recommendationsDto.edate).getTime() -
      new Date(recommendationsDto.sdate).getTime();

    const limit = millisecond / (1000 * 60 * 60 * 24) + 1; //몇일 여행인지 계산

    if (limit > 10) {
      throw new BadRequestException('여행 추천 일정은 최대 10일 입니다');
    }

    const promise = regions.map(async (region) => {
      return this.placeRepository
        .createQueryBuilder('place')
        .select([
          'place.title, place.address, place.mapx, place.mapy, place.image',
        ])
        .where('place.regionId = :id', { id: region })
        .orderBy('RAND()')
        .limit(limit * 2)
        .getRawMany();
    });

    const result = await Promise.all(promise);

    result.forEach((places) => randomPlace.push(...places));

    const transportation =
      recommendationsDto.transportation === 'public' ? '대중교통' : '자차';

    const recommendations = await this.GptService.recommendations(
      randomPlace,
      recommendationsDto.age,
      recommendationsDto.sdate,
      recommendationsDto.edate,
      transportation,
      recommendationsDto.people,
      recommendationsDto.concept,
    );
    return recommendations;
  }

  async getRegions() {
    return this.regionRepository.find();
  }

  async getRating(placeId: number, pagination: PaginationDto) {
    if (isNaN(placeId)) {
      throw new BadRequestException('id는 숫자여야 합니다');
    }

    return this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .select([
        'rating.id',
        'rating.placeId',
        'rating.ratingValue',
        'rating.review',
        'rating.createdAt',
        'user.id',
        'user.profile_img',
        'user.user_name',
      ])
      .where('rating.placeId = :placeId', { placeId })
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();
  }
}
