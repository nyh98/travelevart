import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelRoute } from './entities/travelroute.entity';
import { DetailTravel } from './entities/detailtravel.entity';
import { CreateTravelRouteDto } from './dto/create-travelroute.dto';
import { UpdateDetailTravelDto } from './dto/update-detailtravel.dto';
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

  async addDetailToTravelRoute(travelRouteId: number, details: UpdateDetailTravelDto[]): Promise<DetailTravel[]> {
    const travelRoute = await this.travelRouteRepository.findOne({ where: { id: travelRouteId } });
    if (!travelRoute) {
      throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
    }

    const detailTravels = [];

    for (const detail of details) {
      const place = await this.placeRepository.findOne({ where: { id: detail.place_id } });
      if (!place) {
        throw new NotFoundException(`ID가 ${detail.place_id}인 장소를 찾을 수 없습니당.`);
      }

      const region = await this.regionRepository.findOne({ where: { id: detail.region_id } });
      if (!region) {
        throw new NotFoundException(`ID가 ${detail.region_id}인 지역을 찾을 수 없습니다.`);
      }

      const detailTravel = this.detailTravelRepository.create({
        travelRoute: travelRoute,
        place: place,
        region: region,
        count: detail.count,
        date: detail.date,
        time: detail.time,
        contents: detail.contents,
        traffic_info: detail.traffic_info,
        starting_point: detail.starting_point,
        detailtravel_image: detail.detailtravel_image,
      });

      await this.detailTravelRepository.save(detailTravel);

      detailTravels.push({
        id: detailTravel.id,
        travelroute_id: detailTravel.travelroute_id,
        place_id: detailTravel.place.id,
        region_id: detailTravel.region.id,
        count: detailTravel.count,
        date: detailTravel.date,
        contents: detailTravel.contents,
        traffic_info: detailTravel.traffic_info,
        starting_point: detailTravel.starting_point,
        detailtravel_image: detailTravel.detailtravel_image,
        time: detailTravel.time,
      });
    }

    return detailTravels;
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

    const fork = this.forkRepository.create({ 
      user_id: userId, 
      post_id: postId,
      forked_at: new Date(), 
    });

    await this.forkRepository.save(fork);

    const newTravelRoute = this.travelRouteRepository.create({
      user_id: userId,
      travel_name: travelRoute.travel_name,
      travelroute_range: travelRoute.travelroute_range,
    });
  
    const savedTravelRoute = await this.travelRouteRepository.save(newTravelRoute);
  
    return fork;
  }
  // 포크한 게시글을 기준으로 커스텀
  async forkTravelRoute(userId: number, forkId: number, details: UpdateDetailTravelDto[]): Promise<any[]> {
    const fork = await this.forkRepository.findOne({
      where: { id: forkId },
      relations: ['post'],
    });

    if (!fork) {
      throw new NotFoundException('포크 정보를 찾을 수 없습니다.');
    }

    const post = await this.postRepository.findOne({ where: { id: fork.post_id }, relations: ['travelRoute'] });
    if (!post) {
      throw new NotFoundException('포크한 게시물을 찾을 수 없습니다.');
    }

    const travelRouteId = post.travelRoute.id;
    const travelRoute = await this.travelRouteRepository.findOne({ where: { id: travelRouteId } });
    if (!travelRoute) {
      throw new NotFoundException('여행 경로를 찾을 수 없습니다.');
    }
  
    const detailTravels = [];
  
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    for (const detail of details) {
      const place = await this.placeRepository.findOne({ where: { id: detail.place_id } });
      if (!place) {
        throw new NotFoundException(`ID가 ${detail.place_id}인 장소를 찾을 수 없습니다.`);
      }
  
      const region = await this.regionRepository.findOne({ where: { id: detail.region_id } });
      if (!region) {
        throw new NotFoundException(`ID가 ${detail.region_id}인 지역을 찾을 수 없습니다.`);
      }
  
      const detailTravel = this.detailTravelRepository.create({
        travelRoute,
        place,
        region,
        count: detail.count,
        date: detail.date,
        time: detail.time,
        contents: detail.contents,
        traffic_info: detail.traffic_info,
        starting_point: detail.starting_point,
        detailtravel_image: detail.detailtravel_image,
      });
  
      await this.detailTravelRepository.save(detailTravel);
  
      detailTravels.push({
        id: detailTravel.id,
        place_id: detailTravel.place.id,
        region_id: detailTravel.region.id,
        count: detailTravel.count,
        date: detailTravel.date,
        contents: detailTravel.contents,
        traffic_info: detailTravel.traffic_info,
        starting_point: detailTravel.starting_point,
        detailtravel_image: detailTravel.detailtravel_image,
        time: detailTravel.time,
      });
    }

    return detailTravels;
  }

  // 추천 경로를 기준으로 커스텀
  async recommendTravelRoute(userId: number, recommendationId: number, createTravelRouteDto: CreateTravelRouteDto): Promise<TravelRoute> {
    const recommendedRoute = await this.travelRouteRepository.findOne({
      where: { id: recommendationId },
      relations: ['detailTravels'],
    });

    if (!recommendedRoute) {
      throw new NotFoundException('추천 여행 경로를 찾을 수 없습니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const newTravelRoute = this.travelRouteRepository.create({
      ...createTravelRouteDto,
      user,
    });

    const savedTravelRoute = await this.travelRouteRepository.save(newTravelRoute);

    for (const detail of recommendedRoute.detailTravels) {
      const newDetailTravel = this.detailTravelRepository.create({
        travelRoute: savedTravelRoute,
        place: detail.place,
        region: detail.region,
        count: detail.count,
        date: detail.date,
        time: detail.time,
        contents: detail.contents,
        traffic_info: detail.traffic_info,
        starting_point: detail.starting_point,
      });
      await this.detailTravelRepository.save(newDetailTravel);
    }

    return savedTravelRoute;
  }
}
