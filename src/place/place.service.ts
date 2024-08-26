import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { FindOperator, In, Like, QueryFailedError, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
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
import { Cart } from 'src/cart/entities/cart.entity';

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
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
  ) {}

  async getPlaces(searchOption: SearchPlaceDto) {
    const rating = this.ratingRepository
      .createQueryBuilder()
      .subQuery()
      .select([
        'rating.placeId AS placeId',
        'AVG(rating.ratingValue) AS averageRating',
        'COUNT(*) AS reviewCount',
      ])
      .from(PlaceRating, 'rating')
      .groupBy('rating.placeId')
      .getQuery();

    const cartSave = this.cartRepository
      .createQueryBuilder()
      .subQuery()
      .select(['cart.placeId AS placeId', 'COUNT(*) AS saveCount'])
      .from(Cart, 'cart')
      .groupBy('cart.placeId')
      .getQuery();

    const query = this.placeRepository
      .createQueryBuilder('place')
      .leftJoin(rating, 'rating', 'rating.placeId = place.id')
      .leftJoin(cartSave, 'cart', 'cart.placeId = place.id')
      .select([
        'place.id',
        'place.address AS address',
        'place.image AS image',
        'place.title AS title',
        'place.mapx AS mapx',
        'place.mapy AS mapy',
        'place.viewCount AS viewCount',
        'rating.averageRating AS averageRating',
        'rating.reviewCount AS reviewCount',
        'cart.saveCount AS saveCount',
      ])
      .skip((searchOption.page - 1) * searchOption.limit)
      .take(searchOption.limit);

    //지역 코드가 있을시
    if (searchOption.regionCode) {
      query.where('place.regionId = :regionId', {
        regionId: searchOption.regionCode,
      });

      if (searchOption.district) {
        query.andWhere('place.address LIKE :district', {
          district: `%${searchOption.district}%`,
        });
      }

      if (searchOption.name) {
        query.andWhere('place.title LIKE :name', {
          name: `%${searchOption.name}%`,
        });
      }
    }

    //지역 코드가 없고 하위 검색어가 있을때
    if (!searchOption.regionCode && searchOption.district) {
      query.where('place.address LIKE :district', {
        district: `%${searchOption.district}%`,
      });
      if (searchOption.name) {
        query.andWhere('place.title LIKE :name', {
          name: `%${searchOption.name}%`,
        });
      }
    }

    //지역 코드, 지역 하위 검색어가 없고 여행지 이름 검색어가 있을때
    if (
      !searchOption.regionCode &&
      !searchOption.district &&
      searchOption.name
    ) {
      query.where('place.title LIKE :name', { name: `%${searchOption.name}%` });
    }

    //정렬 기준 디폴트값은 조회수순
    switch (searchOption.sort) {
      case 'rating':
        query.orderBy('averageRating', 'DESC');
        break;
      case 'save':
        query.orderBy('saveCount', 'DESC');
        break;
      case 'review':
        query.orderBy('reviewCount', 'DESC');
        break;
      default:
        query.orderBy('viewCount', 'DESC');
    }

    const result = await query.getRawAndEntities();
    const totalCount = await query.getCount();

    const items = result.raw.map((place) => {
      return {
        id: place.place_id,
        address: place.address,
        image: place.image,
        title: place.title,
        mapx: place.mapx,
        mapy: place.mapy,
        viewCount: place.viewCount,
        reviewCount: place.reviewCount,
        saveCount: place.saveCount,
        averageRating: place.averageRating
          ? Number(place.averageRating).toFixed(1)
          : null,
      };
    });

    return { items, totalCount };
  }

  async getPlaceDetail(placeId: number, userId?: number) {
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

    const utcDate = new Date();
    const utcOffset = utcDate.getTimezoneOffset() * 60000;
    const koreaDate = new Date(utcDate.getTime() + utcOffset + 9 * 60 * 60000);

    try {
      const createOrUpdateRating = this.ratingRepository.create({
        placeId: place.id,
        userId,
        ratingValue: ratingData.ratingValue,
        review: ratingData.review,
        createdAt: koreaDate,
      });

      //기존에 썻던 별점이 있으면 기존꺼 삭제후 새로 추가
      //없으면 새로 추가
      if (rating) {
        await this.ratingRepository.remove(rating);
      }

      await this.ratingRepository.save(createOrUpdateRating);
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

    const regionPromise = [region1, region2, region3].map(async (region) => {
      if (region) {
        return this.regionRepository.findOne({
          select: ['id', 'region'],
          where: { id: region },
        });
      }
    });

    //지역 순서를 보장하기 위해 all 사용
    const regions = (await Promise.all(regionPromise)).filter(
      (region) => region,
    );

    const randomPlace: { region: string; places: Place[] }[] = [];

    const millisecond =
      new Date(recommendationsDto.edate).getTime() -
      new Date(recommendationsDto.sdate).getTime();

    const day = millisecond / (1000 * 60 * 60 * 24) + 1; //몇일 여행인지 계산
    const regionCount = regions.length; //여행 지역 갯수
    let limit = Math.ceil((day * 3) / regionCount); //여행지 조회 갯수

    if (day > 10) {
      throw new BadRequestException('여행 추천 일정은 최대 10일 입니다');
    }

    if (day < regionCount) {
      throw new BadRequestException('여행 일수보다 여행 지역이 많습니다');
    }

    const promise = regions.map(async (region) => {
      return this.placeRepository
        .createQueryBuilder('place')
        .select([
          'place.title, place.address, place.mapx, place.mapy, place.image, place.id',
        ])
        .where('place.regionId = :id', { id: region.id })
        .orderBy('RAND()')
        .limit(limit)
        .getRawMany();
    });

    const result = await Promise.all(promise);

    result.forEach((places, i) => {
      if (places.length) {
        randomPlace.push({ region: regions[i].region, places: places });
      }
    });

    const transportation =
      recommendationsDto.transportation === 'public' ? '대중교통' : '자차';

    const recommendations = await this.GptService.recommendations(
      regions,
      randomPlace,
      day,
      recommendationsDto.age,
      recommendationsDto.sdate,
      recommendationsDto.edate,
      transportation,
      recommendationsDto.people,
    );
    return recommendations;
  }

  async getRegions() {
    const result = await this.regionRepository.find();

    const zero = [{ id: 0, region: '전체' }];

    const regions = zero.concat(result);

    return regions;
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
      .orderBy('rating.id', 'DESC')
      .getManyAndCount();
  }
}
