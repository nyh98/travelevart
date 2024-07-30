import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async searchUserByName(name: string, page: number, limit: number) {
    const [result, total] = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.user_name', 'user.profile_img'])
      .where('user.user_name like :name', { name: `%${name}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const users = result.map((user) => ({
      userId: user.id,
      userName: user.user_name,
      profileImg: user.profile_img,
    }));

    const currentPage = Number(page);
    const totalPage = Math.ceil(total / limit);
    return { users, currentPage, totalPage };
  }

  async getUserDetail(userId: number) {
    if (!userId) {
      throw new BadRequestException('유효하지 않은 userId');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id AS userId',
        'user.email AS email',
        'user.user_name AS userName',
        'user.profile_img AS profileImg',
      ])
      .where('user.id = :userId', { userId })
      .getRawOne();

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  async replaceUserInfoById(
    userId: number,
    profileImg?: string,
    userName?: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    const updateUser = {
      ...user,
      profile_img: profileImg ? profileImg : user.profile_img,
      user_name: userName ? userName : user.user_name,
    };

    await this.userRepository.save(updateUser);
  }
}
