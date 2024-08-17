import {
  IsOptional,
  IsInt,
  IsString,
  IsIn,
  ValidateIf,
  IsNumber,
} from 'class-validator';

export class UpdateDiaryDto {
  @IsOptional()
  @IsInt()
  travelrouteId?: number;

  @IsOptional()
  @IsInt()
  detailtravelId?: number;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsIn([0, 1])
  diaryRange?: number;

  @ValidateIf((o) => o.postId !== undefined)
  @IsNumber()
  @IsOptional()
  diaryId: number;
}
