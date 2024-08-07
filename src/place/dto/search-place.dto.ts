import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'page는 숫자여야 합니다' })
  page: number = 1;

  @Type(() => Number)
  @IsNumber({}, { message: 'limit은 숫자여야 합니다' })
  limit: number = 12;
}

export class SearchPlaceDto extends PaginationDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'region은 숫자여야 합니다' })
  @IsOptional()
  regionCode: number;

  district: string;

  name: string;
}

export class RecommendationsDto {
  @IsNumber({}, { message: '지역은 숫자로 입력해야 합니다' })
  @Type(() => Number)
  region1: number;

  @IsOptional()
  @IsNumber({}, { message: '지역은 숫자로 입력해야 합니다' })
  @Type(() => Number)
  region2: number;

  @IsOptional()
  @IsNumber({}, { message: '지역은 숫자로 입력해야 합니다' })
  @Type(() => Number)
  region3: number;

  @IsDateString({}, { message: '날짜 형식으로 입력해 주세요' })
  sdate: string;

  @IsDateString({}, { message: '날짜 형식으로 입력해 주세요' })
  edate: string;

  @IsEnum({ public: 'public', car: 'car' })
  transportation: 'public' | 'car';

  @IsOptional()
  @IsNumber({}, { message: '나이대는 숫자로 입력해야 합니다' })
  @Type(() => Number)
  age: number;

  @IsOptional()
  @IsNumber({}, { message: '인원수는 숫자로 입력해야 합니다' })
  @Type(() => Number)
  people: number;

  @IsOptional()
  @IsString({ message: '여행 컨셉은 문자열입니다' })
  @Length(1, 5, { message: '컨셉은 5글자가 최대입니다' })
  concept: string;
}
