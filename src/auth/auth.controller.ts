import { Controller, Body, Post, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { QueryFailedError } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async create(@Body() loginData: CreateAuthDto) {
    console.log(loginData);
    try {
      return await this.authService.login(loginData);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        console.log(e);
        throw new ConflictException(
          '쿼리 에러, 중복된 아이디거나 닉네임 입니다',
        );
      }
    }
  }
}
