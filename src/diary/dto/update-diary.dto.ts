import { IsOptional, IsInt, IsString, IsIn, ValidateIf, IsNumber } from 'class-validator';

export class UpdateDiaryDto {
  @IsOptional()
  @IsInt()
  travelroute_id?: number;

  @IsOptional()
  @IsInt()
  detailtravel_id?: number;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsIn([0, 1])
  diary_range?: number;

  @ValidateIf((o) => o.post_id !== undefined)
  @IsNumber()
  @IsOptional()
  diary_id: number;
}
