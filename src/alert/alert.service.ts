import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';
import { Post } from 'src/post/entities/post.entity';
import { Postlike } from 'src/post/entities/postlike.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Postlike)
    private readonly postlikeRepository: Repository<Postlike>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(TravelRoute)
    private readonly travelrouteRepository: Repository<TravelRoute>,

  ) {}

  async getAlert(userId: number) {  
      
  }

  async checkAlert(userId: number) {

  }
}