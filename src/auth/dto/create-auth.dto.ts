import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: '프로필 이미지가 없습니다' })
  @IsString({ message: '잘못된 프로필 형식' })
  profileImg: string;

  @IsNotEmpty({ message: '로그인 제공자가 없습니다' })
  @IsString()
  provider: string;

  @IsNotEmpty({ message: '이름이 없습니다' })
  @IsString({ message: '문자 타입이 아닙니다' })
  userName: string;
}
