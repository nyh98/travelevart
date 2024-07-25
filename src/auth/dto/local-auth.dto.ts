import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LocalJoinAuthDto {
  @IsNotEmpty({ message: '이메일을 입력해 주세요' })
  @IsString({ message: '이메일은 문자열 입니다' })
  @IsEmail({}, { message: '이메일 형식이 아닙니다' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력해 주세요' })
  @IsString({ message: '비밀번호는 문자열 입니다' })
  @MinLength(2, { message: '비밀번호는 최소 2글자 이상입니다' })
  password: string;

  @IsNotEmpty({ message: '닉네임을 입력해 주세요' })
  @IsString({ message: '닉네임은 문자열 입니다' })
  @MinLength(2, { message: '닉네임은 최소 2글자 이상입니다' })
  nickname: string;
}

export class LocalLoginAuthDto {
  @IsNotEmpty({ message: '이메일을 입력해 주세요' })
  @IsString({ message: '이메일은 문자열 입니다' })
  @IsEmail({}, { message: '이메일 형식이 아닙니다' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력해 주세요' })
  @IsString({ message: '비밀번호는 문자열 입니다' })
  @MinLength(2, { message: '비밀번호는 최소 2글자 이상입니다' })
  password: string;
}
