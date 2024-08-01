import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fork } from './entities/fork.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ForkService {
  constructor(
    @InjectRepository(Fork)
    private forkRepository: Repository<Fork>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async forkPost(userId: number, postId: number): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const existingFork = await this.forkRepository.findOne({ where: { user: { id: userId }, post: { id: postId } } });
    if (existingFork) {
      throw new ConflictException('이미 포크한 게시글입니다.');
    }

    const fork = this.forkRepository.create({ user, post });
    const savedFork = await this.forkRepository.save(fork);

    return {
      id: savedFork.id,
      post_id: savedFork.post.id,
      user_id: savedFork.user.id,
      forked_at: savedFork.forked_at,
    };
  }
}
