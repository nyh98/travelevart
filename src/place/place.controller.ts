import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreateOrUpdateRatingDto } from './dto/create-place.dto';
import { SearchPlaceDto } from './dto/search-place.dto';
import { Request } from 'express';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('/search')
  async getPlace(@Query() search: SearchPlaceDto) {
    const [items, totalCount] = await this.placeService.getPlaces(search);

    return {
      items,
      currentPage: search.page,
      totalPage: Math.ceil(totalCount / search.limit),
    };
  }

  @Get('/:id')
  async getTravelDetial(@Param('id') placeId: string) {
    const item = await this.placeService.getPlaceDetail(placeId);

    return { item };
  }

  @Patch('/:id/rating')
  async updatePlaceRating(
    @Param('id') placeId: number,
    @Req() req: Request,
    @Body() ratingData: CreateOrUpdateRatingDto,
  ) {
    await this.placeService.updatePlaceRating(
      placeId,
      req.user.id,
      ratingData.ratingValue,
    );
    return { message: '별점 등록 되었습니다' };
  }

  @Delete('/:id/rating')
  async deletePlaceRating(@Param('id') placeId: number, @Req() req: Request) {
    await this.placeService.deletePlaceRating(placeId, req.user.id);
    return { message: '별점 삭제 되었습니다' };
  }

  @Get('/asd/asd')
  async dbSave() {
    await this.placeService.dbSave();
    return { message: 'good' };
  }
}
