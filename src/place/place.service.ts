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
import { SearchPlaceDto } from './dto/search-place.dto';
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

  async GPT_TEST() {
    const re = await this.placeRepository
      .createQueryBuilder('place')
      .select([
        'place.title, place.address, place.mapx, place.mapy, place.image',
      ])
      .where('place.regionId = :id1', { id1: 1 })
      .orWhere('place.regionId = :id2', { id2: 2 })
      .orWhere('place.regionId = :id3', { id3: 3 })
      .orderBy('RAND()')
      .limit(10)
      .getRawMany();

    return this.GptService.test(re);
    // return re;
  }

  async dbSave() {
    // const result = await this.HttpService.axiosRef.get<TourAPI>(
    //   'https://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=9999&pageNo=1&MobileOS=ETC&MobileApp=AppTest&ServiceKey=9r%2FsEsRkteEXizn9Ler4fllgsAYjEITh020%2FKtfOUheaArWMxp0Ad3jLDiPB8QV9v6ovtQqdD3oxLfj9PQR5fA%3D%3D&listYN=Y&arrange=C&contentTypeId=12&areaCode=31&sigunguCode=&cat1=&cat2=&cat3=&_type=json',
    // );

    // result.data.response.body.items.item.forEach(async (place) => {
    //   await this.placeRepository.insert({
    //     address: place.addr1,
    //     image: place.firstimage,
    //     title: place.title,
    //     mapx: Number(place.mapx),
    //     mapy: Number(place.mapy),
    //     regionId: 3
    //   });
    // });
    // console.log('끝');

    // result.data.response.body.items.item.forEach(async (place) => {
    //   await this.HttpService.axiosRef
    //     .get<TourAPIDetail>(
    //       `https://apis.data.go.kr/B551011/KorService1/detailCommon1?ServiceKey=4qAsXp8XRxSLrU08TFz6Qp9ah%2Fj4Qj4C5cnGS0Op%2BWSBEN2WpdIZ1jnWxTtNCUhlwy0GYGg5vIy0KnuHscZtJQ%3D%3D&contentTypeId=12&contentId=${place.contentid}&MobileOS=ETC&MobileApp=AppTest&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&_type=json`,
    //     )
    //     .then(async (detail) => {
    //       if (detail.data.response) {
    //         await this.placeRepository.insert({
    //           address: place.addr1,
    //           image: place.firstimage ? place.firstimage : null,
    //           title: place.title,
    //           mapx: Number(place.mapx),
    //           mapy: Number(place.mapy),
    //           descreiption: detail.data.response.body.items.item[0].overview,
    //           regionId: 17,
    //         });
    //       }
    //     })
    //     .catch((e) => console.log(e));
    // });

    console.log('저장 끝~');
  }
}
