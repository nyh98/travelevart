import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchPlaceDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'region은 숫자여야 합니다' })
  @IsOptional()
  regionCode: number;

  district: string;

  name: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'page는 숫자여야 합니다' })
  page: number = 1;

  @Type(() => Number)
  @IsNumber({}, { message: 'limit은 숫자여야 합니다' })
  limit: number = 12;
}

export class RecommendationsDto {
  @IsNumber()
  @Type(() => Number)
  region1: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  region2: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  region3: number;

  @IsDateString()
  sdate: string;

  @IsDateString()
  edate: string;

  @IsEnum({ public: 'public', car: 'car' })
  transportation: 'public' | 'car';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  age: number;

  @IsOptional()
  @IsNumber()
  @IsString()
  concept: string;
}
