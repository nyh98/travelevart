import { Type } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsDate, ValidateNested, IsArray, IsDateString } from 'class-validator';

export class UpdateDetailTravelDto {
  @IsOptional()
  @IsString()
  transportOption?: string;  // 'public' 또는 'car'

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailTravelItemDto)
  items?: DetailTravelItemDto[];
}

export class DetailTravelItemDto {
  @IsOptional()
  @IsDateString()
  date?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailTravelDetailDto)
  details?: DetailTravelDetailDto[];
}

export class DetailTravelDetailDto {
  @IsOptional()
  @IsNumber()
  placeId?: number;

  @IsOptional()
  @IsNumber()
  routeIndex?: number;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsNumber()
  regionId?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  detailtravelId?: number;

  @IsOptional()
  @IsString()
  placeTitle?: string;

  @IsOptional()
  @IsString()
  placeImage?: string;

  @IsOptional()
  @IsString()
  mapLink?: string | null;
}
