import { Type } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsDate, ValidateNested, IsArray } from 'class-validator';

export class UpdateDetailTravelDto {
  @IsString()
  transport_option: string;  // 'public' 또는 'car'

  @IsArray()
  items: {
    date: Date; // 여행 날짜
    details: {
      place_id: number;
      routeIndex: number;
      contents: string;
      region_id: number;
      address: string;
      place_title: string;
      place_image: string;
      map_link: string | null;
    }[];
  }[];
}

export class CreateDetailTravelItemDto {
  @IsDate()
  date: Date;

  @ValidateNested({ each: true })
  @Type(() => UpdateDetailTravelDto)
  details: UpdateDetailTravelDto[];
}
