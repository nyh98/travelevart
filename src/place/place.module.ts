import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { HttpModule } from '@nestjs/axios';
import { Region } from './entities/region.entity';
import { PlaceRating } from './entities/placeRating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Place, Region, PlaceRating]), HttpModule],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
