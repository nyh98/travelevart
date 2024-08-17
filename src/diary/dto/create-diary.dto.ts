import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsIn,
} from 'class-validator';

export class CreateDiaryDto {
  @IsNotEmpty()
  @IsInt()
  travelrouteId: number;

  @IsNotEmpty()
  @IsInt()
  detailtravelId: number;

  @IsNotEmpty()
  @IsString()
  contents: string;

  @IsOptional()
  @IsIn([0, 1])
  diaryRange?: number;
}
