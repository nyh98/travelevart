import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreateOrUpdateRatingDto } from './dto/create-place.dto';
import {
  PaginationDto,
  RecommendationsDto,
  SearchPlaceDto,
} from './dto/search-place.dto';
import { Request } from 'express';
import { Place } from './entities/place.entity';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('/search')
  async getPlace(@Query() search: SearchPlaceDto) {
    const { items, totalCount } = await this.placeService.getPlaces(search);

    return {
      items,
      currentPage: search.page,
      totalPage: Math.ceil(totalCount / search.limit),
    };
  }

  @Get('/recommendations')
  async recommendations(@Query() recommendationsDto: RecommendationsDto) {
    const result = await this.placeService.recommendations(recommendationsDto);

    return result;
  }

  @Get('/region')
  async getRegions() {
    const result = await this.placeService.getRegions();
    return { regions: result };
  }

  @Get('/:id/rating')
  async getPlaceRating(
    @Param('id') placeId: number,
    @Query() pagination: PaginationDto,
  ) {
    const [raws, totalCount] = await this.placeService.getRating(
      placeId,
      pagination,
    );

    const camelCase = raws.map((result) => {
      return {
        ...result,
        user: {
          id: result.user.id,
          profileImg: result.user.profile_img,
          userName: result.user.user_name,
        },
      };
    });
    return {
      totalReviews: totalCount,
      reviews: camelCase,
      currentPage: pagination.page,
      totalPage: Math.ceil(totalCount / pagination.limit),
    };
  }

  @Get('/:id')
  async getTravelDetial(@Param('id') placeId: number, @Req() req: Request) {
    const result = await this.placeService.getPlaceDetail(
      placeId,
      req.user ? req.user.id : null,
    );

    return {
      item: result.place,
      averageRating: result.average,
      totalSaveCount: result.totalSaveCount,
      isSaved: result.isSaved,
    };
  }

  @Post('/:id/rating')
  async updatePlaceRating(
    @Param('id') placeId: number,
    @Req() req: Request,
    @Body() ratingData: CreateOrUpdateRatingDto,
  ) {
    await this.placeService.updatePlaceRating(placeId, req.user.id, ratingData);
    return { message: '리뷰가 등록 되었습니다' };
  }

  @Delete('/:id/rating')
  async deletePlaceRating(@Param('id') placeId: number, @Req() req: Request) {
    await this.placeService.deletePlaceRating(placeId, req.user.id);
    return { message: '리뷰가 삭제 되었습니다' };
  }
}
