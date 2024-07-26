import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class authMiddleware implements NestMiddleware {
  constructor(private readonly AuthService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    //카카오 서버에 토큰 검증
    const isValidKakaoToken = await this.AuthService.validKakaoToken(token);

    if (isValidKakaoToken) {
      req.user = isValidKakaoToken.user;

      return next();
    }

    //카카오 서버에서 아니라고 하면 로컬 토큰 검증
    const isValidLocalToken = await this.AuthService.validLocalToken(token);

    if (isValidLocalToken) {
      req.user = isValidLocalToken.user;
      return next();
    }

    throw new UnauthorizedException('유효하지 않은 토큰');
  }
}
