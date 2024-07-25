import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class User {
  @IsString({ message: 'image는 문자열이어야 합니다' })
  image: string;

  @IsString({ message: 'name은 문자열이어야 합니다' })
  name: string;
}

export class KakaoAuthDto {
  @IsNotEmpty({ message: 'uid가 없습니다' })
  @IsString({ message: 'uid는 문자열 이여야 합니다' })
  uid: string;

  @IsObject({ message: '유저 정보는 객체여야 합니다' })
  @ValidateNested()
  @Type(() => User)
  user: User;
}
