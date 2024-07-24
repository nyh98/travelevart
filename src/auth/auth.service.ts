import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private JwtService: JwtService,
  ) {}

  async login(loginData: CreateAuthDto) {
    const user = await this.userRepository.findOne({
      where: { uid: loginData.uid, provider: loginData.provider },
    });

    let payload: { userId: number; provider: string; uid: string };

    //유저가 존재하면
    if (user) {
      payload = { userId: user.id, provider: user.provider, uid: user.uid };
    } else {
      //유저가 존재하지 않으면 DB 업데이트
      const result = await this.userRepository.insert({
        profile_img: loginData.user.image,
        provider: loginData.provider,
        user_name: loginData.user.name,
        uid: loginData.uid,
      });

      payload = {
        userId: result.raw.insertId,
        provider: loginData.provider,
        uid: loginData.uid,
      };
    }
    const accessToken = await this.JwtService.signAsync(payload);

    return {
      userId: payload.userId,
      provider: payload.provider,
      uid: payload.uid,
      accessToken,
    };
  }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
