import { IsNotEmpty, IsInt, IsOptional, IsString, IsDate, IsIn } from 'class-validator';

export class CreateDiaryDto {
  @IsNotEmpty()
  @IsInt()
  customtravel_id: number;

  @IsNotEmpty()
  @IsInt()
  detailtravel_id: number;

  @IsNotEmpty()
  @IsString()
  contents: string;

  @IsOptional()
  @IsIn([0, 1])
  diary_range?: number;
}
