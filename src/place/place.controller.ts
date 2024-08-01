import { Controller, Get, Query } from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { SearchPlaceDto } from './dto/search-place.dto';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  async getTravels(@Query() search: SearchPlaceDto) {
    return search;
  }

  @Get()
  async dbSave() {
    await this.placeService.dbSave();
    return { message: 'good' };
  }
}
