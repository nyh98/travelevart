import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
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

    const detailsToCreate = [];

    for (const item of updateDetailTravelDto.items) {
        if (!item.date || !Array.isArray(item.details) || item.details.length === 0) {
            throw new BadRequestException('date 필요함');
        }

        for (const detail of item.details) {
            if (!detail.placeId || typeof detail.routeIndex !== 'number' ) {
                throw new BadRequestException('placeId랑 routeIndex 필요함');
            }

            const place = await this.placeRepository.findOne({
                where: { id: detail.placeId },
            });
            if (!place) {
                throw new NotFoundException(` ${detail.placeId}이 placeId 없음`);
            }

            detailsToCreate.push({
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
        }
    }

    const createdDetails = await this.detailTravelRepository.save(detailsToCreate);

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
  async updateTravelRoute(
    travelrouteId: number,
    updateTravelRouteDto: {
      travelName?: string;
      travelrouteRange?: number;
      startDate?: Date;
      endDate?: Date;
      transportOption?: string;
    }
  ): Promise<any> {
    const travelRoute = await this.travelRouteRepository.findOne({
      where: { id: travelrouteId },
    });

    if (!travelRoute) {
      throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
    }
    travelRoute.travelName = updateTravelRouteDto.travelName || travelRoute.travelName;
    travelRoute.travelrouteRange = updateTravelRouteDto.travelrouteRange || travelRoute.travelrouteRange;

    const updateTravelRoute = this.travelRouteRepository.create({
      id: travelrouteId,
      travelName: updateTravelRouteDto.travelName,
      travelrouteRange: updateTravelRouteDto.travelrouteRange,
      startDate: travelRoute.startDate, 
      endDate: travelRoute.endDate,      
    });

    return this.travelRouteRepository.save(updateTravelRoute);
  }
  async updateDetailTravels(
    travelrouteId: number, 
    updateRequest: UpdateDetailTravelDto
  ): Promise<any> {

    const { transportOption, items } = updateRequest;

    for (const item of items) {
      const { date, details } = item;

      const detailTravels = await this.detailTravelRepository.find({
        where: { travelrouteId, date },
      });
      if (!detailTravels || detailTravels.length === 0) {
        throw new NotFoundException(`해당 여행 경로 및 날짜 (${date})에 대한 정보 업서용.`);
      }

      for (const detail of details) {
        const detailTravel = detailTravels.find(dt => dt.routeIndex === detail.routeIndex);
        if (detailTravel) {
          if (detail.placeId) {
            const place = await this.placeRepository.findOne({ where: { id: detail.placeId } });
            if (!place) {
              throw new NotFoundException(`id ${detail.placeId}인 곳 없어용`);
            }
            detailTravel.placeId = place.id;
            detailTravel.address = place.address;
            detailTravel.placeImage = place.image;
            detailTravel.placeTitle = place.title;
            detailTravel.regionId = place.regionId;
          }

          detailTravel.transportOption = transportOption;

          detailTravel.contents = detail.contents ?? detailTravel.contents;
          detailTravel.mapLink = detail.mapLink ?? detailTravel.mapLink;

          await this.detailTravelRepository.save(detailTravel);
        }
      }
    }

    return { message: '성공' };
  }
  async getTravelRoute(userId: number, page: number, pageSize: number): Promise<any> {
    const travelRoutes = await this.travelRouteRepository.find({
      where: { userId: userId },
      relations: ['detailTravels'], 
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,  
      take: pageSize,  
    });

    if (!travelRoutes || travelRoutes.length === 0) {
      throw new NotFoundException('해당 사용자의 여행 경로를 찾을 수 없습니다.');
    }

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
      
      const dateKey = date.toISOString().split('T')[0]; 

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

    const transportOption = detailTravels.length > 0 ? detailTravels[0].transportOption : 'public'; 

    return {
      transportOption: transportOption,
      items: Object.values(groupedByDate)
    };
  }
  async deleteTravelRoute(travelrouteId: number): Promise<void> {
  const travelRoute = await this.travelRouteRepository.findOne({ where: { id: travelrouteId } });
    if (!travelRoute) {
        throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
    }
    await this.travelRouteRepository.remove(travelRoute);
  }
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

    const newTravelRoute = this.travelRouteRepository.create({
      userId: userId,
      travelName: travelRoute.travelName,
      travelrouteRange: travelRoute.travelrouteRange,
    });

    const savedTravelRoute = await this.travelRouteRepository.save(newTravelRoute);

    const detailTravels = await this.detailTravelRepository.find({ where: { travelrouteId: travelRoute.id } });

    for (const detailTravel of detailTravels) {
      const newDetailTravel = this.detailTravelRepository.create({
        travelrouteId: savedTravelRoute.id,  
        placeId: detailTravel.placeId,
        routeIndex: detailTravel.routeIndex,  
        regionId: detailTravel.regionId,
        date: detailTravel.date,
        contents: detailTravel.contents,
        transportOption: detailTravel.transportOption, 
        address: detailTravel.address,
        placeTitle: detailTravel.placeTitle,
        placeImage: detailTravel.placeImage,
        mapLink: detailTravel.mapLink,
      });

      await this.detailTravelRepository.save(newDetailTravel);
    }
  }
  async saveRecommendedRoute(
    createTravelRouteDto: CreateTravelRouteDto,
    userId: number,
  ): Promise<any> {
    try {
      const { travelName, travelrouteRange, transportOption, detailRoute } = createTravelRouteDto;

      const startDate = new Date(detailRoute[0].date);
    const endDate = new Date(detailRoute[detailRoute.length - 1].date);

    const newTravelRoute = this.travelRouteRepository.create({
      userId: userId,
      travelName,
      travelrouteRange,
      startDate,
      endDate,
    });
  
      const savedTravelRoute = await this.travelRouteRepository.save(newTravelRoute);
      
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
          throw error;
        }
      }));
      await this.detailTravelRepository.save(detailTravelEntities);
      return { message: '성공' };    
      } catch (error) {
      console.error('Error in saveRecommendedRoute:', error);
      throw error; 
    }
  }
}
