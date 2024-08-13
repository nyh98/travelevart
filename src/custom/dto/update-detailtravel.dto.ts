import { Type } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsDate, ValidateNested } from 'class-validator';

export class UpdateDetailTravelDto {
  @IsNumber()
  place_id: number;

  @IsNumber()
  routeIndex: number;

  @IsNumber()
  region_id: number;

  @IsDate()
  date: Date;

  @IsString()
  playTime: string;

  @IsString()
  contents: string;

  @IsString()
  transportOption: string;

  @IsString()
  starting_point: string;

  @IsString()
  detailtravel_image: string;

  @IsString()
  address: string;

  @IsString()
  placeTitle: string;

  @IsString()
  placeImage: string;

  @IsNumber()
  day: number;

  @IsOptional()
  @IsString()
  mapLink?: string;

  @IsOptional()
  @IsNumber()
  accommodation_day?: number;

  @IsOptional()
  @IsString()
  accommodation_address?: string;

  @IsOptional()
  @IsString()
  accommodation_title?: string;

  @IsOptional()
  @IsString()
  accommodation_reservationLink?: string;
}

export class CreateDetailTravelItemDto {
  @IsDate()
  date: Date;

  @ValidateNested({ each: true })
  @Type(() => UpdateDetailTravelDto)
  details: UpdateDetailTravelDto[];
}
