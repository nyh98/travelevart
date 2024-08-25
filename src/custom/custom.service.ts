import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import { TravelRoute } from './entities/travelroute.entity';
import { DetailTravel } from './entities/detailtravel.entity';
import { CreateTravelRouteDto } from './dto/create-travelroute.dto';
import {
  DetailTravelDetailDto,
  DetailTravelItemDto,
  UpdateDetailTravelDto,
} from './dto/update-detailtravel.dto';
import { User } from 'src/user/entities/user.entity';
import { Place } from 'src/place/entities/place.entity';
import { Region } from 'src/place/entities/region.entity';
import { Post } from 'src/post/entities/post.entity';
import { Alert } from 'src/alert/entities/alert.entity';
import { AlertGateway } from 'src/alert/alert.gateway';

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
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private readonly alertGateway: AlertGateway
  ) {}

  async createTravelRoute(
    userId: number,
    createTravelRouteDto: CreateTravelRouteDto,
  ): Promise<TravelRoute> {
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
    updateDetailTravelDto: UpdateDetailTravelDto,
  ): Promise<any> {
    const travelRoute = await this.travelRouteRepository.findOne({
      where: { id: travelrouteId },
    });
    if (!travelRoute) {
      throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
    }

    const detailsToCreate = [];

    for (const item of updateDetailTravelDto.items) {
      if (
        !item.date ||
        !Array.isArray(item.details) ||
        item.details.length === 0
      ) {
        throw new BadRequestException('date 필요함');
      }

      for (const detail of item.details) {
        if (!detail.placeId || typeof detail.routeIndex !== 'number') {
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

    const createdDetails =
      await this.detailTravelRepository.save(detailsToCreate);

    const response = {
      transportOption: updateDetailTravelDto.transportOption,
      items: createdDetails.reduce((acc, detail) => {
        const date = detail.date.toISOString().split('T')[0];
        let item = acc.find((i) => i.date === date);

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
    userId: number,
    updateTravelRouteDto: {
      travelName?: string;
      travelrouteRange?: number;
      startDate?: Date;
      endDate?: Date;
      transportOption?: string;
    },
  ) {
    // 여행 경로를 가져옴
    const travelRoute = await this.travelRouteRepository.findOne({
      where: { id: travelrouteId, userId },
      relations: ['detailTravels'],
    });
  
    if (!travelRoute) {
      throw new NotFoundException('여행 루트가 없습니다');
    }
  
    // 업데이트할 객체
    let updateObject: Partial<TravelRoute> = { id: travelRoute.id };
  
    // 조건에 따라 존재하는 필드만 업데이트함
    if (updateTravelRouteDto.travelName) {
      updateObject.travelName = updateTravelRouteDto.travelName;
    }
  
    if (updateTravelRouteDto.endDate) {
      updateObject.endDate = updateTravelRouteDto.endDate;
    }
  
    if (updateTravelRouteDto.startDate) {
      updateObject.startDate = updateTravelRouteDto.startDate;
    }
  
    // travelrouteRange가 undefined가 아닐 때만 업데이트
    if (updateTravelRouteDto.travelrouteRange !== undefined) {
      updateObject.travelrouteRange = updateTravelRouteDto.travelrouteRange;
    }
  
    // 업데이트
    const newRoute = await this.travelRouteRepository.save(updateObject);
  
    // 날짜가 바뀌면
    if (newRoute.startDate || newRoute.endDate) {
      const { detailTravels } = travelRoute;
      
      // 새로운 상세 경로 목록 생성 (첫날의 데이터만 포함)
      const newDetailTravels = detailTravels
        .map((detail, i) => {
          if (detail.placeId) {
            return {
              ...detail,
              id: undefined,
              routeIndex: i,
              date: newRoute.startDate,
            };
          }
        })
        .filter((detail) => detail);
  
      // 첫날의 데이터만 업데이트, 첫날 제외한 데이터는 생성하지 않음
      if (newDetailTravels.length > 0) {
        await this.detailTravelRepository.save(newDetailTravels);
      }
  
      // 기존 detailTravels 제거
      await this.detailTravelRepository.remove(detailTravels);
    }
  
    return { message: '여행 경로가 성공적으로 업데이트되었습니다.' };
  }

  async updateDetailTravels(
    travelrouteId: number,
    updateRequest: UpdateDetailTravelDto,
  ): Promise<any> {
    const { transportOption, items } = updateRequest;

    for (const item of items) {
      const { date, details } = item;

      // 해당 날짜의 기존 detailTravels를 가져옵니다.
      const detailTravels = await this.detailTravelRepository.find({
        where: { travelrouteId, date },
      });

      // 날짜가 일치하는 일정이 없으면 빈 배열로 초기화합니다.
      if (!detailTravels || detailTravels.length === 0) {
        throw new NotFoundException(
          `해당 여행 경로 및 날짜 (${date})에 대한 정보 업서용.`,
        );
      }

      for (const detail of details) {
        let detailTravel = detailTravels.find(
          (dt) => dt.routeIndex === detail.routeIndex,
        );

        // 해당 routeIndex가 존재하지 않으면 새로운 일정을 추가합니다.
        if (!detailTravel) {
          detailTravel = this.detailTravelRepository.create({
            travelrouteId,
            routeIndex: detail.routeIndex,
            date: new Date(date),
            transportOption,
            contents: detail.contents,
            mapLink: detail.mapLink,
          });
        }

        // 장소 정보가 제공된 경우
        if (detail.placeId) {
          const place = await this.placeRepository.findOne({
            where: { id: detail.placeId },
          });
          if (!place) {
            throw new NotFoundException(`id ${detail.placeId}인 곳 없어용`);
          }
          detailTravel.placeId = place.id;
          detailTravel.address = place.address;
          detailTravel.placeImage = place.image;
          detailTravel.placeTitle = place.title;
          detailTravel.regionId = place.regionId;
        }

        // transportOption 업데이트
        detailTravel.transportOption = transportOption;

        // 나머지 필드 업데이트 (메모 및 지도 링크)
        detailTravel.contents = detail.contents ?? detailTravel.contents;
        detailTravel.mapLink = detail.mapLink ?? detailTravel.mapLink;

        await this.detailTravelRepository.save(detailTravel);
      }
    }

    return { message: '성공' };
  }
  async getTravelRoute(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<any> {
    const totalRoutesCount = await this.travelRouteRepository.count({
      where: { userId: userId },
    });

    const travelRoutes = await this.travelRouteRepository.find({
      where: { userId: userId },
      relations: ['detailTravels'],
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    if (!travelRoutes || travelRoutes.length === 0) {
      throw new NotFoundException(
        '해당 사용자의 여행 경로를 찾을 수 없습니다.',
      );
    }

    const totalPage = Math.ceil(totalRoutesCount / pageSize);

    const result = travelRoutes.map((route) => {
      const firstDetailTravel =
        route.detailTravels.length > 0 ? route.detailTravels[0] : null;
      const detailtravelImage = firstDetailTravel
        ? firstDetailTravel.placeImage &&
          firstDetailTravel.placeImage.trim() !== ''
          ? firstDetailTravel.placeImage
          : null
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

    return {
      totalPage: totalPage,
      currentPage: page,
      routes: result,
    };
  }
  async getDetailTravel(travelrouteId: number): Promise<any> {
    const detailTravels = await this.detailTravelRepository.find({
      where: { travelrouteId: travelrouteId },
    });

    if (!detailTravels || detailTravels.length === 0) {
      throw new NotFoundException('세부 여행 정보를 찾을 수 없습니다.');
    }

    const groupedByDate = detailTravels.reduce((acc, detail) => {
      const date =
        detail.date instanceof Date ? detail.date : new Date(detail.date);

      if (isNaN(date.getTime())) {
        throw new Error('유효하지 않은 날짜 형식이 포함되어 있습니다.');
      }

      const dateKey = date.toISOString().split('T')[0];

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          details: [],
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
        mapLink: detail.mapLink,
      });

      return acc;
    }, {});

    const transportOption =
      detailTravels.length > 0 ? detailTravels[0].transportOption : 'public';

    return {
      transportOption: transportOption,
      items: Object.values(groupedByDate),
    };
  }
  async deleteTravelRoute(travelrouteId: number): Promise<void> {
    const travelRoute = await this.travelRouteRepository.findOne({
      where: { id: travelrouteId },
    });
    if (!travelRoute) {
      throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
    }
    await this.travelRouteRepository.remove(travelRoute);
  }
  async deleteDetailTravel(detailtravelId: number): Promise<void> {
    const detailTravel = await this.detailTravelRepository.findOne({
      where: { id: detailtravelId },
    });
    if (!detailTravel) {
      throw new NotFoundException('세부 여행 정보를 찾을 수 없습니다.');
    }
    await this.detailTravelRepository.remove(detailTravel);
  }
  async forkPost(userId: number, postId: number): Promise<any> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['travelRoute'],
    });
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
      startDate: travelRoute.startDate,
      endDate: travelRoute.endDate
    });

    const savedTravelRoute =
      await this.travelRouteRepository.save(newTravelRoute);

    // --------------------성률 침범 영역---------------------
    if (post.user_id != userId) {
      const alert = this.alertRepository.create({
        rec_user_id: post.user_id,  // 게시글 작성자를 알림의 수신자로 설정
        send_user_id: userId,  // 좋아요한 사용자를 알림의 발신자로 설정
        type: 'fork',  // 알림 타입을 'like'로 설정
        travelRoute_id: post.travelRoute.id,  // 참조 ID를 생성된 좋아요의 ID로 설정
      });
      await this.alertRepository.save(alert);
      // 전체 알림 수 계산
      const totalAlerts = await this.alertRepository.count({
        where: { rec_user_id: post.user_id },
      });

      // 실시간 알림 전송
      const message = totalAlerts;
      this.alertGateway.sendAlertToUser(post.user_id, message);
    }
    // ------------------------------------------------------

    const detailTravels = await this.detailTravelRepository.find({
      where: { travelrouteId: travelRoute.id },
    });

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
      const detailTravelEntities = await Promise.all(
        detailRoute.map(async (detail) => {
          try {
            const place = await this.placeRepository.findOne({
              where: {
                id: detail.placeId,
              },
            });
  
            if (!place) {
              throw new NotFoundException(`Place not found for ID: ${detail.placeId}`);
            }
            const detailTravel = this.detailTravelRepository.create({
              travelrouteId: savedTravelRoute.id,
              placeId: place.id,
              routeIndex: detail.routeIndex,
              regionId: place.regionId,
              date: new Date(detail.date),
              contents: null,
              transportOption: transportOption,
              address: place.address, 
              placeTitle: place.title, 
              placeImage: place.image, 
              mapLink: detail.mapLink,
            });
            return detailTravel;
          } catch (error) {
            console.error('Error while creating DetailTravel:', error);
            throw error;
          }
        }),
      );
      await this.detailTravelRepository.save(detailTravelEntities);
      return { message: '성공' };
    } catch (error) {
      console.error('Error in saveRecommendedRoute:', error);
      throw error;
    }
  }
  
}