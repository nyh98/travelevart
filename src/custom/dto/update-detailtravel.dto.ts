import { Type } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsDate, ValidateNested, IsArray } from 'class-validator';

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
  @IsDate()
  @Type(() => Date)
  date?: Date; // 여행 날짜

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
  placeTitle?: string;

  @IsOptional()
  @IsString()
  placeImage?: string;

  @IsOptional()
  @IsString()
  mapLink?: string | null;
}
