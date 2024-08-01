import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

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
