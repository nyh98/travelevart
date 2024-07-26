import { Controller, Body, Post, HttpCode, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoAuthDto } from './dto/kakao-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalJoinAuthDto, LocalLoginAuthDto } from './dto/local-auth.dto';

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

  @Post('/local/token')
  async refreshToken(
    @Headers('Authorization') refreshToken: string,
    @Body('userId') userId: number,
  ) {
    const newAccessToken = await this.authService.validRefreshToken(
      refreshToken,
      userId,
    );
    return { accessToken: newAccessToken };
  }

  @Post('/local/logout')
  async logout(@Headers('Authorization') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: '로그아웃 완료' };
  }
}
