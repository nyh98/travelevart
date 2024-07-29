import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'provider는 문자열 이여야 합니다' })
  @IsNotEmpty({ message: 'provider가 존재하지 않습니다' })
  @IsEnum(
    { kakao: 'kakao', local: 'local' },
    { message: 'provider는 kakao 또는 local 입니다' },
  )
  provider: string;

  @IsString({ message: 'refreshToken은 문자열 이여야 합니다' })
  @IsNotEmpty({ message: 'refreshToken이 없습니다' })
  refreshToken: string;

  @IsNumber({}, { message: 'userId는 숫자 이여야 합니다' })
  @IsNotEmpty({ message: 'userId가 존재햐지 않습니다' })
  userId: number;
}
