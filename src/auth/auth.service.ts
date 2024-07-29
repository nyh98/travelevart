import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { KakaoAuthDto } from './dto/kakao-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LocalJoinAuthDto, LocalLoginAuthDto } from './dto/local-auth.dto';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private JwtService: JwtService,
    private HttpService: HttpService,
    private RedisService: RedisService,
    private ConfigService: ConfigService,
  ) {}

  async kakaoLogin(loginData: KakaoAuthDto) {
    const user = await this.userRepository.findOne({
      where: { uid: loginData.uid, provider: 'kakao' },
    });

    try {
      //유저가 존재하지 않으면 DB 업데이트
      if (!user) {
        const userEntity = this.userRepository.create({
          profile_img: loginData.user.image,
          provider: 'kakao',
          user_name: loginData.user.name,
          uid: loginData.uid,
        });

        const result = await this.userRepository.save(userEntity);

        return {
          userId: result.id,
          provider: 'kakao',
          uid: loginData.uid,
        };
      }
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        e.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('중복된 이메일 또는 닉네임 입니다');
      }

      throw new InternalServerErrorException('서버에러 관리자에게 문의 바람');
    }

    return {
      userId: user.id,
      provider: user.provider,
      uid: user.uid,
    };
  }

  async localJoin(localJoinData: LocalJoinAuthDto) {
    const user = this.userRepository.create({
      provider: 'local',
      user_name: localJoinData.nickname,
      email: localJoinData.email,
      password: await bcrypt.hash(localJoinData.password, 12),
    });
    await this.userRepository.save(user);
  }

  async localLogin(localLoginData: LocalLoginAuthDto) {
    console.log(localLoginData);
    const user = await this.userRepository.findOne({
      where: { email: localLoginData.email },
    });

    if (!user) {
      throw new NotFoundException('이메일이 틀립니다');
    }

    const isValidPwd = await bcrypt.compare(
      localLoginData.password,
      user.password,
    );

    if (!isValidPwd) {
      throw new BadRequestException('비밀번호가 틀립니다');
    }

    const payload = { userId: user.id };
    const accessToken = await this.JwtService.signAsync(payload);
    const refeshToken = await this.JwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    this.RedisService.setRefreshToken(
      user.id.toString(),
      refeshToken,
      60 * 60 * 24 * 7,
    );
    return {
      userInfo: {
        userId: user.id,
        email: user.email,
        name: user.user_name,
        profileImg: user.profile_img || '프로필',
      },
      provider: user.provider,
      accessToken: accessToken,
      refreshToken: refeshToken,
    };
  }

  async validKakaoToken(kakaoAccessToken: string) {
    try {
      const response = await this.HttpService.axiosRef.get<{
        expiresInMillis: number;
        id: number;
        expires_in: number;
        app_id: number;
        appId: number;
      }>('https://kapi.kakao.com/v1/user/access_token_info', {
        headers: { Authorization: `Bearer ${kakaoAccessToken}` },
      });

      if (response.status === 200) {
        const user = await this.userRepository.findOne({
          where: { uid: response.data.id.toString() },
        });
        if (user) {
          return { user };
        }
        throw new NotFoundException('서비스에 가입되지 않았습니다');
      }
    } catch (e) {
      return false;
    }
  }

  async validLocalToken(LocalAccessTokenToken: string) {
    try {
      const decoded = await this.JwtService.verifyAsync<{ userId: number }>(
        LocalAccessTokenToken,
      );
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });
      return { user };
    } catch (e) {
      return false;
    }
  }

  async validLocalRefreshToken(refreshToken: string, userId: number) {
    try {
      const token = await this.RedisService.getRefreshToken(userId);

      if (!token || token !== refreshToken) {
        throw new UnauthorizedException('세션 만료 다시 로그인 해주세요');
      }

      const decode = await this.JwtService.verifyAsync<{ userId: number }>(
        refreshToken,
      );
      const payload = { userId: decode.userId };
      const newAccessToken = await this.JwtService.signAsync(payload);
      return newAccessToken;
    } catch (e) {
      throw new UnauthorizedException('세션 만료 다시 로그인 해주세요');
    }
  }

  async validKakaoRefreshToken(refreshToken: string) {
    let newAccessToken: string;
    try {
      const response = await this.HttpService.axiosRef.post<{
        access_token: string;
        token_type: string;
        refresh_token?: string;
        expires_in: number;
        refresh_token_expires_in?: number;
      }>(
        'https://kauth.kakao.com/oauth/token',
        {
          grant_type: 'refresh_token',
          client_id: this.ConfigService.get<string>('KAKAO_CLIENT_KEY'),
          refresh_token: refreshToken,
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      newAccessToken = response.data.access_token;
    } catch (e) {
      throw new UnauthorizedException('세션 만료 다시 로그인 해주세요');
    }
    return newAccessToken;
  }

  async logout(refreshToken: string) {
    try {
      const decoded = await this.JwtService.verifyAsync<{ userId: number }>(
        refreshToken,
      );
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });
      await this.RedisService.deleteRefreshToken(user.id);
    } catch (e) {}
  }
}
