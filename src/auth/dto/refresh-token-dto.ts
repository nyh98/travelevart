import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'refreshToken은 문자열 이여야 합니다' })
  @IsNotEmpty({ message: 'refreshToken이 없습니다' })
  refreshToken: string;
}
