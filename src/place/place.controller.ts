import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { SearchPlaceDto } from './dto/search-place.dto';

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

  @Get('asdasdasdasdsad')
  async dbSave() {
    await this.placeService.dbSave();
    return { message: 'good' };
  }
}
