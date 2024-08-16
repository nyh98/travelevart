import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TravelRoute } from './entities/travelroute.entity';
import { DetailTravel } from './entities/detailtravel.entity';
import { CreateTravelRouteDto } from './dto/create-travelroute.dto';
import { DetailTravelDetailDto, DetailTravelItemDto, UpdateDetailTravelDto } from './dto/update-detailtravel.dto';
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
      userId: userId,
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
          where: { id: detail.placeId },
        });
        if (!place) {
          throw new NotFoundException(`Place with id ${detail.placeId} not found`);
        }

        const newDetailTravel = this.detailTravelRepository.create({
          travelrouteId: travelrouteId,
          placeId: detail.placeId,
          routeIndex: detail.routeIndex,
          contents: detail.contents,
          regionId: place.regionId,
          address: place.address,          
          placeTitle: place.title,  
          placeImage: place.image,   
          mapLink: detail.mapLink || null, 
          transportOption: updateDetailTravelDto.transportOption,
          date: new Date(item.date),
        });
  
        const savedDetailTravel = await this.detailTravelRepository.save(newDetailTravel);
        createdDetails.push(savedDetailTravel);
      }
    }
  
    const response = {
      transportOption: updateDetailTravelDto.transportOption,
      items: createdDetails.reduce((acc, detail) => {
        const date = detail.date.toISOString().split('T')[0];
        let item = acc.find(i => i.date === date);
  
        if (!item) {
          item = { date, details: [] };
          acc.push(item);
        }
  
        item.details.push({
          detailtravelId: detail.id,
          travelrouteId: detail.travelrouteId,
          placeId: detail.placeId,
          routeIndex: detail.routeIndex,
          contents: detail.contents,
          regionId: detail.regionId,
          address: detail.address,
          placeTitle: detail.placeTitle,
          placeImage: detail.placeImage,
          mapLink: detail.mapLink,
        });
  
        return acc;
      }, []),
    };
  
    return response;
  }
  
// TravelRoute 수정
async updateTravelRoute(
  travelrouteId: number,
  updateTravelRouteDto: {
    travelName?: string;
    travelrouteRange?: number;
    startDate?: Date | string;
    endDate?: Date | string;
    transportOption?: string;
  }
): Promise<any> {
  // console.log(travelrouteId)
  const travelRoute = await this.travelRouteRepository.findOne({
    where: { id: travelrouteId },
    relations: ['detailTravels'],
  });

  if (!travelRoute) {
    throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
  }
  
  const originalStartDate = new Date(travelRoute.startDate);
  const originalEndDate = new Date(travelRoute.endDate);

  // DTO에서 전달된 startDate와 endDate를 Date 객체로 변환
  const newStartDate = updateTravelRouteDto.startDate ? new Date(updateTravelRouteDto.startDate) : null;
  const newEndDate = updateTravelRouteDto.endDate ? new Date(updateTravelRouteDto.endDate) : null;

  travelRoute.travelName = updateTravelRouteDto.travelName || travelRoute.travelName;
  travelRoute.travelrouteRange = updateTravelRouteDto.travelrouteRange || travelRoute.travelrouteRange;
  travelRoute.startDate = newStartDate || travelRoute.startDate;
  travelRoute.endDate = newEndDate || travelRoute.endDate;

  if (newStartDate && newStartDate !== originalStartDate) {
    if (newStartDate > originalStartDate) {
      // console.log(travelrouteId)
      await this.detailTravelRepository.delete({
        travelrouteId,
        date: Between(
          originalStartDate,
          new Date(newStartDate.getTime() - 86400000) // 1일을 빼서 새로운 Date 객체 생성
        ),
      });
    } else if (newStartDate < originalStartDate) {
      await this.createBasicDetailTravelForNewDates(
        travelrouteId,
        newStartDate,
        new Date(originalStartDate.getTime() - 86400000), // 1일을 빼서 새로운 Date 객체 생성
        updateTravelRouteDto.transportOption || travelRoute.detailTravels[0]?.transportOption || 'public'
      );
    }
  }

  if (newEndDate && newEndDate !== originalEndDate) {
    if (newEndDate < originalEndDate) {
      // console.log(travelrouteId)
      await this.detailTravelRepository.delete({
        travelrouteId,
        date: Between(
          new Date(newEndDate.getTime() + 86400000), // 1일을 더해서 새로운 Date 객체 생성
          originalEndDate
        ),
      });
    } else if (newEndDate > originalEndDate) {
      // console.log(travelrouteId)
      await this.createBasicDetailTravelForNewDates(
        travelrouteId,
        new Date(originalEndDate.getTime() + 86400000), // 1일을 더해서 새로운 Date 객체 생성
        newEndDate,
        updateTravelRouteDto.transportOption || travelRoute.detailTravels[0]?.transportOption || 'public'
      );
    }
  }

  return this.travelRouteRepository.save(travelRoute);
}



// 새로운 날짜에 대한 DetailTravel 기본 정보 생성
private async createBasicDetailTravelForNewDates(
  travelrouteId: number,
  startDate: Date,
  endDate: Date,
  transportOption: string
) {
  // console.log(travelrouteId)
  let currentDate = new Date(startDate);

  // 날짜를 하나씩 증가시키며 반복
  while (currentDate <= endDate) {
    // DetailTravel 생성
    const newDetailTravel = this.detailTravelRepository.create({
      travelrouteId: travelrouteId,
      date: currentDate,
      transportOption: transportOption,
      placeId: null,  // 기본값으로 null, 필요 시 이후 업데이트 가능
      regionId: null, // 기본값으로 null, 필요 시 이후 업데이트 가능
      address: '',
      placeTitle: '',
      placeImage: '',
      routeIndex: null, // 기본값으로 null
    });
    // console.log(travelrouteId)

    // 생성한 DetailTravel 저장
    await this.detailTravelRepository.save(newDetailTravel);

    // 날짜 증가
    currentDate.setDate(currentDate.getDate() + 1);
  }
}


async updateDetailTravel(
  detailtravelId: number, 
  detail: DetailTravelDetailDto
): Promise<any> {
  
  // Find the existing detail travel record by ID
  const detailTravel = await this.detailTravelRepository.findOne({ where: { id: detailtravelId } });
  if (!detailTravel) {
    throw new NotFoundException('세부 여행 정보를 찾을 수 없습니다.');
  }

  // If a new placeId is provided, fetch the associated place details
  let place;
  if (detail.placeId) {
    place = await this.placeRepository.findOne({ where: { id: detail.placeId } });
    if (!place) {
      throw new NotFoundException(`Place with id ${detail.placeId} not found`);
    }
  }

  // Update the detail travel fields, either from the input or the existing values
  detailTravel.routeIndex = detail.routeIndex ?? detailTravel.routeIndex;
  detailTravel.contents = detail.contents ?? detailTravel.contents;
  detailTravel.placeId = detail.placeId ?? detailTravel.placeId;
  detailTravel.mapLink = detail.mapLink ?? detailTravel.mapLink;

  // If a new placeId is provided, update the related fields
  if (place) {
    detailTravel.address = place.address;
    detailTravel.placeImage = place.image;
    detailTravel.placeTitle = place.title;
    detailTravel.regionId = place.regionId;
  }

  // Save the updated detail travel record
  return this.detailTravelRepository.save(detailTravel);
}



// TravelRoute 조회
async getTravelRoute(userId: number): Promise<any> {
  const travelRoutes = await this.travelRouteRepository.find({
    where: { userId: userId },
    relations: ['detailTravels'], // detailTravels를 함께 로드합니다.
  });

  if (!travelRoutes || travelRoutes.length === 0) {
    throw new NotFoundException('해당 사용자의 여행 경로를 찾을 수 없습니다.');
  }

  // travelRoutes에 첫 번째 detailTravel의 placeId와 detailtravelImage를 추가합니다.
  const result = travelRoutes.map(route => {
    const firstDetailTravel = route.detailTravels.length > 0 ? route.detailTravels[0] : null;
    const detailtravelImage = firstDetailTravel 
    ? (firstDetailTravel.placeImage && firstDetailTravel.placeImage.trim() !== "" ? firstDetailTravel.placeImage : null) 
    : null;
    return {
      id: route.id,
      userId: route.userId,
      travelName: route.travelName,
      travelrouteRange: route.travelrouteRange,
      startDate: route.startDate,
      endDate: route.endDate,
      detailtravelImage: detailtravelImage,
    };
  });

  return result;
}


// DetailTravel 조회
async getDetailTravel(travelrouteId: number): Promise<any> {
  const detailTravels = await this.detailTravelRepository.find({ where: { travelrouteId: travelrouteId } });

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
      detailtravelId: detail.id,
      travelrouteId: detail.travelrouteId,
      placeId: detail.placeId,
      routeIndex: detail.routeIndex,
      regionId: detail.regionId,
      contents: detail.contents,
      address: detail.address,
      placeTitle: detail.placeTitle,
      placeImage: detail.placeImage,
      mapLink: detail.mapLink
    });

    return acc;
  }, {});

  const transportOption = detailTravels.length > 0 ? detailTravels[0].transportOption : 'public'; // 첫 번째 여행 정보의 교통 수단 옵션을 사용

  return {
    transportOption: transportOption,
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

async forkPost(userId: number, postId: number): Promise<any> {
  const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['travelRoute'] });
  if (!post) {
    throw new NotFoundException('게시글을 찾을 수 없습니다.');
  }

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('사용자를 찾을 수 없습니다.');
  }

  const travelRoute = post.travelRoute;
  if (!travelRoute) {
    throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
  }

  // 새로운 TravelRoute 데이터 생성
  const newTravelRoute = this.travelRouteRepository.create({
    userId: userId,
    travelName: travelRoute.travelName,
    travelrouteRange: travelRoute.travelrouteRange,
  });

  const savedTravelRoute = await this.travelRouteRepository.save(newTravelRoute);

  // 원래 travelRoute에 연결된 detailtravel 데이터 가져오기
  const detailTravels = await this.detailTravelRepository.find({ where: { travelrouteId: travelRoute.id } });

  // 새 travelRoute에 맞게 detailtravel 데이터 복제
  for (const detailTravel of detailTravels) {
    const newDetailTravel = this.detailTravelRepository.create({
      travelrouteId: savedTravelRoute.id,  // 새로운 travelroute_id
      placeId: detailTravel.placeId,
      routeIndex: detailTravel.routeIndex,  // 'count'를 'routeIndex'로 수정
      regionId: detailTravel.regionId,
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
}

  // 추천 경로를 기준으로 커스텀
  async saveRecommendedRoute(
    createTravelRouteDto: CreateTravelRouteDto,
    userId: number,
  ): Promise<any> {
    try {
      const { travelName, travelrouteRange, transportOption, detailRoute } = createTravelRouteDto;
  
      // 새로운 TravelRoute 생성
      const newTravelRoute = this.travelRouteRepository.create({
        userId: userId,
        travelName,
        travelrouteRange,
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
            travelrouteId: savedTravelRoute.id,
            placeId: place.id,
            routeIndex: detail.routeIndex,
            regionId: place.regionId,
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
