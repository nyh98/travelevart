import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { FindOperator, Like, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { TourAPI, TourAPIDetail } from 'src/types/tourAPI';
import { SearchPlaceDto } from './dto/search-place.dto';
import { take } from 'rxjs';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place) private placeRepository: Repository<Place>,
    private HttpService: HttpService,
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

  async dbSave() {
    // const result = await this.HttpService.axiosRef.get<TourAPI>(
    //   'https://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=9999&pageNo=1&MobileOS=ETC&MobileApp=AppTest&ServiceKey=9r%2FsEsRkteEXizn9Ler4fllgsAYjEITh020%2FKtfOUheaArWMxp0Ad3jLDiPB8QV9v6ovtQqdD3oxLfj9PQR5fA%3D%3D&listYN=Y&arrange=C&contentTypeId=12&areaCode=35&sigunguCode=&cat1=&cat2=&cat3=&_type=json',
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
    //       `https://apis.data.go.kr/B551011/KorService1/detailCommon1?ServiceKey=9r%2FsEsRkteEXizn9Ler4fllgsAYjEITh020%2FKtfOUheaArWMxp0Ad3jLDiPB8QV9v6ovtQqdD3oxLfj9PQR5fA%3D%3D&contentTypeId=12&contentId=${place.contentid}&MobileOS=ETC&MobileApp=AppTest&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&_type=json`,
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
    //           regionId: 8,
    //         });
    //       }
    //     })
    //     .catch((e) => console.log(e));
    // });

    console.log('저장 끝~');
  }
}
