import {
  Controller,
  Body,
  Post,
  HttpCode,
  Get,
  Headers,
  BadRequestException,
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

    if (data.provider === 'kakao') {
      newAccessToken = await this.authService.validKakaoRefreshToken(
        data.refreshToken,
      );
    }

    if (data.provider === 'local') {
      newAccessToken = await this.authService.validLocalRefreshToken(
        data.refreshToken,
        data.userId,
      );
    }
    console.log(newAccessToken);
    return { accessToken: newAccessToken };
  }

  @Post('/local/logout')
  async logout(@Headers('Authorization') credentialData: string) {
    if (!credentialData) {
      throw new BadRequestException('인증 정보가 없습니다');
    }

    const refreshToken = credentialData.split(' ')[1];
    console.log(refreshToken);
    await this.authService.logout(refreshToken);

    return { message: '로그아웃 완료' };
  }
}
