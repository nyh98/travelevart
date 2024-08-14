import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TravelRoute } from './entities/travelroute.entity';
import { DetailTravel } from './entities/detailtravel.entity';
import { CreateTravelRouteDto } from './dto/create-travelroute.dto';
import { CreateDetailTravelItemDto, UpdateDetailTravelDto } from './dto/update-detailtravel.dto';
import { User } from 'src/user/entities/user.entity';
import { Place } from 'src/place/entities/place.entity';
import { Region } from 'src/place/entities/region.entity';
import { Post } from 'src/post/entities/post.entity';
import { Fork } from './entities/fork.entity';


@Injectable()
export class TravelRouteService {
  constructor(
    @InjectRepository(TravelRoute)
    private travelRouteRepository: Repository<TravelRoute>,
    @InjectRepository(DetailTravel)
    private detailTravelRepository: Repository<DetailTravel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
    @InjectRepository(Fork)
    private forkRepository: Repository<Fork>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async createTravelRoute(userId: number, createTravelRouteDto: CreateTravelRouteDto): Promise<TravelRoute> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const travelRoute = this.travelRouteRepository.create({
      ...createTravelRouteDto,
      user: { id: userId },
    });
    return this.travelRouteRepository.save(travelRoute);
  }

  async addDetailToTravelRoute(
    travelrouteId: number,
    updateDetailTravelDto: UpdateDetailTravelDto
  ): Promise<any> {
    const travelRoute = await this.travelRouteRepository.findOne({
      where: { id: travelrouteId },
    });
    if (!travelRoute) {
      throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
    }
  
    const createdDetails = [];

    for (const item of updateDetailTravelDto.items) {
      for (const detail of item.details) {
        const place = await this.placeRepository.findOne({
          where: { id: detail.place_id },
        });
        if (!place) {
          throw new NotFoundException(`Place with id ${detail.place_id} not found`);
        }

        const newDetailTravel = this.detailTravelRepository.create({
          travelroute_id: travelrouteId,
          place_id: detail.place_id,
          routeIndex: detail.routeIndex,
          contents: detail.contents,
          region_id: place.regionId,
          address: place.address,          
          placeTitle: place.title,  
          placeImage: place.image,   
          mapLink: detail.map_link || null, 
          transportOption: updateDetailTravelDto.transport_option,
          date: new Date(item.date),
        });
  
        const savedDetailTravel = await this.detailTravelRepository.save(newDetailTravel);
        createdDetails.push(savedDetailTravel);
      }
    }
  
    const response = {
      transport_option: updateDetailTravelDto.transport_option,
      items: createdDetails.reduce((acc, detail) => {
        const date = detail.date.toISOString().split('T')[0];
        let item = acc.find(i => i.date === date);
  
        if (!item) {
          item = { date, details: [] };
          acc.push(item);
        }
  
        item.details.push({
          detailtravel_id: detail.id,
          travelroute_id: detail.travelroute_id,
          place_id: detail.place_id,
          route_index: detail.routeIndex,
          contents: detail.contents,
          region_id: detail.region_id,
          address: detail.address,
          place_title: detail.placeTitle,
          place_image: detail.placeImage,
          map_link: detail.mapLink,
        });
  
        return acc;
      }, []),
    };
  
    return response;
  }
  
  
  
 // TravelRoute 수정
// TravelRoute 수정
async updateTravelRoute(
  travelrouteId: number,
  updateTravelRouteDto: {
    travel_name?: string;
    travelroute_range?: number;
    start_date?: Date;
    end_date?: Date;
    transport_option?: string;
  }
): Promise<any> {
  // 여행 경로가 존재하는지 확인
  const travelRoute = await this.travelRouteRepository.findOne({
    where: { id: travelrouteId },
  });
  if (!travelRoute) {
    throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
  }

  const originalStartDate = travelRoute.start_date;
  const originalEndDate = travelRoute.end_date;

  // travelRoute 정보 업데이트
  travelRoute.travel_name = updateTravelRouteDto.travel_name || travelRoute.travel_name;
  travelRoute.travelroute_range = updateTravelRouteDto.travelroute_range || travelRoute.travelroute_range;
  travelRoute.start_date = updateTravelRouteDto.start_date || travelRoute.start_date;
  travelRoute.end_date = updateTravelRouteDto.end_date || travelRoute.end_date;

  // start_date가 변경된 경우 처리
  if (updateTravelRouteDto.start_date && updateTravelRouteDto.start_date < originalStartDate) {
    // 새 start_date 이전에 추가된 날짜에 대한 세부 여행 정보 생성
    await this.createBasicDetailTravelForNewDates(
      travelrouteId,
      updateTravelRouteDto.start_date,
      originalStartDate,
      updateTravelRouteDto.transport_option
    );
  }

  // end_date가 변경된 경우 처리
  if (updateTravelRouteDto.end_date && updateTravelRouteDto.end_date > originalEndDate) {
    // 새 end_date 이후에 추가된 날짜에 대한 세부 여행 정보 생성
    await this.createBasicDetailTravelForNewDates(
      travelrouteId,
      originalEndDate,
      updateTravelRouteDto.end_date,
      updateTravelRouteDto.transport_option
    );
  }

  // 업데이트된 여행 경로 저장
  return this.travelRouteRepository.save(travelRoute);
}

// 새로운 날짜에 대한 DetailTravel 기본 정보 생성
private async createBasicDetailTravelForNewDates(
  travelrouteId: number,
  startDate: Date,
  endDate: Date,
  transportOption: string
) {
  // startDate에서 endDate까지 반복하면서 새로운 날짜에 대한 기본 세부 여행 정보 생성
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const newDetailTravel = this.detailTravelRepository.create({
      travelroute_id: travelrouteId,
      date: new Date(currentDate),
      transportOption: transportOption, // transport_option만 설정
    });
    await this.detailTravelRepository.save(newDetailTravel);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}


// DetailTravel 수정
async updateDetailTravel(
  detailtravelId: number,
  updateDetailTravelDto: UpdateDetailTravelDto
): Promise<any> {
  // 세부 여행 정보 조회
  const detailTravel = await this.detailTravelRepository.findOne({
    where: { id: detailtravelId },
  });
  if (!detailTravel) {
    throw new NotFoundException('세부 여행 정보를 찾을 수 없습니다.');
  }

  // DTO에 있는 항목을 detailTravel 엔티티에 업데이트
  const detail = updateDetailTravelDto.items[0].details[0];

  detailTravel.routeIndex = detail.routeIndex || detailTravel.routeIndex;
  detailTravel.contents = detail.contents || detailTravel.contents;
  detailTravel.region_id = detail.region_id || detailTravel.region_id;
  detailTravel.address = detail.address || detailTravel.address;
  detailTravel.placeTitle = detail.place_title || detailTravel.placeTitle;
  detailTravel.placeImage = detail.place_image || detailTravel.placeImage;
  detailTravel.mapLink = detail.map_link || detailTravel.mapLink;
  detailTravel.transportOption =
    updateDetailTravelDto.transport_option || detailTravel.transportOption;

  // 날짜와 관련된 필드 업데이트
  detailTravel.date = updateDetailTravelDto.items[0].date
    ? new Date(updateDetailTravelDto.items[0].date)
    : detailTravel.date;

  // 업데이트된 세부 정보 저장
  return this.detailTravelRepository.save(detailTravel);
}



// TravelRoute 조회
async getTravelRoute(userId: number): Promise<any> {
  const travelRoutes = await this.travelRouteRepository.find({ where: { user_id: userId }});
  if (!travelRoutes || travelRoutes.length === 0) {
      throw new NotFoundException('해당 사용자의 여행 경로를 찾을 수 없습니다.');
  }
  return travelRoutes;
}


// DetailTravel 조회
async getDetailTravel(travelrouteId: number): Promise<any> {
  const detailTravels = await this.detailTravelRepository.find({ where: { travelroute_id: travelrouteId } });

  if (!detailTravels || detailTravels.length === 0) {
    throw new NotFoundException('세부 여행 정보를 찾을 수 없습니다.');
  }

  const groupedByDate = detailTravels.reduce((acc, detail) => {
    const date = detail.date instanceof Date ? detail.date : new Date(detail.date);
    
    if (isNaN(date.getTime())) {
      throw new Error('유효하지 않은 날짜 형식이 포함되어 있습니다.');
    }
    
    const dateKey = date.toISOString().split('T')[0]; // 날짜를 'YYYY-MM-DD' 형식으로 변환

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        details: []
      };
    }

    acc[dateKey].details.push({
      detailtravel_id: detail.id,
      travelroute_id: detail.travelroute_id,
      place_id: detail.place_id,
      route_index: detail.routeIndex,
      region_id: detail.region_id,
      contents: detail.contents,
      address: detail.address,
      place_title: detail.placeTitle,
      place_image: detail.placeImage,
      map_link: detail.mapLink
    });

    return acc;
  }, {});

  const transportOption = detailTravels.length > 0 ? detailTravels[0].transportOption : 'public'; // 첫 번째 여행 정보의 교통 수단 옵션을 사용

  return {
    transport_option: transportOption,
    items: Object.values(groupedByDate)
  };
}





// TravelRoute 삭제
async deleteTravelRoute(travelrouteId: number): Promise<void> {
  const travelRoute = await this.travelRouteRepository.findOne({ where: { id: travelrouteId } });
  if (!travelRoute) {
      throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
  }
  await this.travelRouteRepository.remove(travelRoute);
  
}

// DetailTravel 삭제
async deleteDetailTravel(detailtravelId: number): Promise<void> {
  const detailTravel = await this.detailTravelRepository.findOne({ where: { id: detailtravelId} });
  if (!detailTravel) {
      throw new NotFoundException('세부 여행 정보를 찾을 수 없습니다.');
  }
  await this.detailTravelRepository.remove(detailTravel);
}

async forkPost(userId: number, postId: number): Promise<Fork> {
  const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['travelRoute'] });
  if (!post) {
    throw new NotFoundException('게시글을 찾을 수 없습니다.');
  }

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('사용자를 찾을 수 없습니다.');
  }

  const existingFork = await this.forkRepository.findOne({ where: { user: { id: userId }, post: { id: postId } } });
  if (existingFork) {
    throw new ConflictException('이미 포크한 게시글입니다.');
  }

  const travelRoute = post.travelRoute;
  if (!travelRoute) {
    throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
  }

  // 포크 데이터 생성
  const fork = this.forkRepository.create({ 
    user_id: userId, 
    post_id: postId,
    forked_at: new Date(), 
  });

  await this.forkRepository.save(fork);

  // 새로운 TravelRoute 데이터 생성
  const newTravelRoute = this.travelRouteRepository.create({
    user_id: userId,
    travel_name: travelRoute.travel_name,
    travelroute_range: travelRoute.travelroute_range,
  });

  const savedTravelRoute = await this.travelRouteRepository.save(newTravelRoute);

  // 원래 travelRoute에 연결된 detailtravel 데이터 가져오기
  const detailTravels = await this.detailTravelRepository.find({ where: { travelroute_id: travelRoute.id } });

  // 새 travelRoute에 맞게 detailtravel 데이터 복제
  for (const detailTravel of detailTravels) {
    const newDetailTravel = this.detailTravelRepository.create({
      travelroute_id: savedTravelRoute.id,  // 새로운 travelroute_id
      place_id: detailTravel.place_id,
      routeIndex: detailTravel.routeIndex,  // 'count'를 'routeIndex'로 수정
      region_id: detailTravel.region_id,
      date: detailTravel.date,
      contents: detailTravel.contents,
      transportOption: detailTravel.transportOption,  // 'traffic_info'를 'transportOption'으로 수정
      address: detailTravel.address,
      placeTitle: detailTravel.placeTitle,
      placeImage: detailTravel.placeImage,
      mapLink: detailTravel.mapLink,
    });

      await this.detailTravelRepository.save(newDetailTravel);
  }

  return fork;
}

  // 추천 경로를 기준으로 커스텀
  async saveRecommendedRoute(
    createTravelRouteDto: CreateTravelRouteDto,
    userId: number,
  ): Promise<any> {
    try {
      const { travel_name, travelroute_range, transportOption, detailRoute } = createTravelRouteDto;
  
      // 새로운 TravelRoute 생성
      const newTravelRoute = this.travelRouteRepository.create({
        user_id: userId,
        travel_name,
        travelroute_range,
      });
  
      // TravelRoute 저장
      const savedTravelRoute = await this.travelRouteRepository.save(newTravelRoute);
      
      // DetailTravel 데이터 저장
      const detailTravelEntities = await Promise.all(detailRoute.map(async detail => {
        try {
          const place = await this.placeRepository.findOne({
            where: {
              address: detail.address,
              title: detail.placeTitle,
            },
          });
          
          if (!place) {
            throw new NotFoundException(`Place not found for address: ${detail.address}, title: ${detail.placeTitle}`);
          }
  
          const detailTravel = this.detailTravelRepository.create({
            travelroute_id: savedTravelRoute.id,
            place_id: place.id,
            routeIndex: detail.routeIndex,
            region_id: place.regionId,
            date: new Date(detail.date),
            contents: null,
            transportOption: transportOption,
            address: detail.address,
            placeTitle: detail.placeTitle,
            placeImage: detail.placeImage,
            mapLink: detail.mapLink,
          });
  
          return detailTravel;
        } catch (error) {
          console.error('Error while creating DetailTravel:', error);
          throw error;  // 다시 던져서 외부에서 처리할 수 있게 함
        }
      }));
      return savedTravelRoute;
    } catch (error) {
      console.error('Error in saveRecommendedRoute:', error);
      throw error;  // 최종적으로 외부에서 처리
    }
  }


}
