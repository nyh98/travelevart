import { Type } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsDate, ValidateNested, IsArray } from 'class-validator';

export class UpdateDetailTravelDto {
  @IsString()
  transportOption: string;  // 'public' 또는 'car'

  @IsArray()
  items: {
    date: Date; // 여행 날짜
    details: {
      placeId: number;
      routeIndex: number;
      contents: string;
      regionId: number;
      address: string;
      placeTitle: string;
      placeImage: string;
      mapLink: string | null;
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
