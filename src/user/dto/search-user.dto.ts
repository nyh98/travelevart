import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SearchUserDto {
  name: string = '수혁';

  @Type(() => Number)
  @IsNumber({}, { message: 'page는 숫자여야 합니다' })
  page: number = 1;

  @Type(() => Number)
  @IsNumber({}, { message: 'limit는 숫자여야 합니다' })
  limit: number = 10;
}
