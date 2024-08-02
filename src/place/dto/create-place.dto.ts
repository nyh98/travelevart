import { IsNumber, Max, Min } from 'class-validator';

export class CreateOrUpdateRatingDto {
  @IsNumber({}, { message: '별점은 숫자여야 합니다' })
  @Min(0, { message: '별점은 최소 0점입니다' })
  @Max(5, { message: '별점은 최대 5점입니다' })
  ratingValue: number;
}
