import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { TourAPI, TourAPIDetail } from 'src/types/tourAPI';
import { SearchPlaceDto } from './dto/search-place.dto';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place) private placeRepository: Repository<Place>,
    private HttpService: HttpService,
  ) {}

  async getTravels(searchOption: SearchPlaceDto) {
    searchOption.district;
    await this.placeRepository.find({ where: {} });
  }

  async dbSave() {
    // const result = await this.HttpService.axiosRef.get<TourAPI>(
    //   'https://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=9999&pageNo=1&MobileOS=ETC&MobileApp=AppTest&ServiceKey=4qAsXp8XRxSLrU08TFz6Qp9ah%2Fj4Qj4C5cnGS0Op%2BWSBEN2WpdIZ1jnWxTtNCUhlwy0GYGg5vIy0KnuHscZtJQ%3D%3D&listYN=Y&arrange=C&contentTypeId=12&areaCode=2&sigunguCode=&cat1=&cat2=&cat3=&_type=json',
    // );

    // result.data.response.body.items.item.forEach(async (place) => {
    //   await this.placeRepository.insert({
    //     address: place.addr1,
    //     image: place.firstimage,
    //     title: place.title,
    //     mapx: Number(place.mapx),
    //     mapy: Number(place.mapy),
    //     region: '부산',
    //   });
    // });
    // console.log('끝');

    // result.data.response.body.items.item.forEach(async (place) => {
    //   await this.HttpService.axiosRef
    //     .get<TourAPIDetail>(
    //       `https://apis.data.go.kr/B551011/KorService1/detailCommon1?ServiceKey=4qAsXp8XRxSLrU08TFz6Qp9ah%2Fj4Qj4C5cnGS0Op%2BWSBEN2WpdIZ1jnWxTtNCUhlwy0GYGg5vIy0KnuHscZtJQ%3D%3D&contentTypeId=12&contentId=${place.contentid}&MobileOS=ETC&MobileApp=AppTest&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&_type=json`,
    //     )
    //     .then(async (detail) => {
    //       await this.placeRepository.insert({
    //         address: place.addr1,
    //         image: place.firstimage ? place.firstimage : null,
    //         title: place.title,
    //         mapx: Number(place.mapx),
    //         mapy: Number(place.mapy),
    //         descreiption: detail.data.response
    //           ? detail.data.response.body.items.item[0].overview
    //           : null,
    //         region: '인천',
    //       });
    //     })
    //     .catch((e) => console.log(e));
    // });

    console.log('저장 끝~');
  }
}
