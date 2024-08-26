import {
  Controller,
  Body,
  Post,
  HttpCode,
  Headers,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoAuthDto } from './dto/kakao-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalJoinAuthDto, LocalLoginAuthDto } from './dto/local-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/kakao/login')
  async kakao(@Body() loginData: KakaoAuthDto) {
    return await this.authService.kakaoLogin(loginData);
  }

  @Post('/local/join')
  async localJoin(@Body() localjoinData: LocalJoinAuthDto) {
    await this.authService.localJoin(localjoinData);
    return { message: '회원가입 성공' };
  }

  @Post('/local/login')
  @HttpCode(200)
  async localLogin(@Body() loginData: LocalLoginAuthDto) {
    return this.authService.localLogin(loginData);
  }

  @Post('/token')
  async refreshToken(@Body() data: RefreshTokenDto) {
    let newAccessToken: string;

    //카카오 토큰 재발급 요청
    const isValidKakaoRefreshToken =
      await this.authService.validKakaoRefreshToken(data.refreshToken);
    if (isValidKakaoRefreshToken) {
      newAccessToken = isValidKakaoRefreshToken.newAccessToken;
    }

    //만약 카카오가 아니라고 하면 로컬 토큰 재발급
    const isValidLocalRefreshToken =
      await this.authService.validLocalRefreshToken(data.refreshToken);

    if (isValidLocalRefreshToken) {
      newAccessToken = isValidLocalRefreshToken.newAccessToken;
    }

    //카카오, 로컬 둘다 유효하지 않다면 403
    if (!newAccessToken) {
      throw new ForbiddenException('세션 만료 다시 로그인 해주세요');
    }

    return { accessToken: newAccessToken };
  }

  @Post('/local/logout')
  async logout(@Headers('Authorization') credentialData: string) {
    if (!credentialData) {
      throw new BadRequestException('인증 정보가 없습니다');
    }

    const refreshToken = credentialData.split(' ')[1];

    await this.authService.logout(refreshToken);

    return { message: '로그아웃 완료' };
  }
}
