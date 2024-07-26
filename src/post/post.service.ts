import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { GetPostsDto, PostDetailDto, PostPostsDto } from './dto/post.dto';
import { Postlike } from './entities/postlike.entity';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Postlike)
    private readonly likeRepository: Repository<Postlike>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getPosts(query: GetPostsDto): Promise<{ posts: PostDetailDto[]; currentPage: number, totalPage: number}> {
    let { target, searchName, page, pageSize } = query;
    const qb = this.postRepository.createQueryBuilder('post'); // SELECT * FROM post

    if (!target) {
      target = '전체 게시글';
    }
    if (searchName) {
      target = '전체 게시글';
    }

    try {
      if (target === '전체 게시글') {
        qb.andWhere('post.title LIKE :searchName', { searchName: `%${searchName}%` });
        qb.orderBy('post.created_at', 'DESC');
      }

      else if (!searchName) {
        if (target !== '전체 게시글') {
          if (target === '인기 여행글') {
            // fix. 인기 여행글 알고리즘 추가해야됨
            qb.andWhere('post.custom_id IS NOT NULL');
          } else if (target === '인기 똥글') {
            // fix. 인기 똥글 알고리즘 추가해야됨
            qb.andWhere('post.custom_id IS NULL');
          }
        }
      }

      // 페이지네이션
      qb.skip((page - 1) * pageSize).take(pageSize);

      // 쿼리 실행 및 결과 가져오기
      const [posts, total] = await qb.getManyAndCount();

      // 전체 페이지 수 계산
      const totalPage = Math.ceil(total / pageSize);

      const postDetail = posts.map(post => ({
        id: post.id,
        author: `user${post.user_id}`, // fix. 유저번호로 닉네임 받아오는 SQL 추가해야됨
        title: post.title,
        views: post.view_count,
        commentsCount: 0, // fix. 댓글 DB에서 받오는거 추가해야됨
        created_at: post.created_at,
        travelRoute_id: post.travelRoute_id, // fix. 커스텀 여행 DB에서 받아서 추가해야됨(프론트분들에게 0보다 크면 true로 바꿔달라하기~)
        like: 0, // fix. 좋아요 DB에서 받아오는거 추가해야됨
      }));

      // 응답 데이터 구조화
      return {
        posts: postDetail,
        currentPage: Number(page),
        totalPage: totalPage,
      };
    } catch (error) {
      throw new HttpException('삐빅 서버 에러입니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    };
  };

  async getDetailPost(id: number): Promise<PostDetailDto> {
    try {
      const post = await this.postRepository.findOne({ where: { id } });
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return {
        id: post.id,
        author: `user${post.user_id}`, // fix. 유저번호로 닉네임 받아오는 SQL 추가해야됨
        title: post.title,
        views: post.view_count,
        commentsCount: 0, // fix. 댓글 DB에서 받오는거 추가해야됨
        created_at: post.created_at,
        travelRoute_id: 0, // fix. 커스텀 여행 DB에서 받아서 추가해야됨
        contents: post.contents,
        like: 0, // fix. 좋아요 DB에서 받아오는거 추가해야됨
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Database query failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createPost(postPostsDto: PostPostsDto) {
    try {
      const { title, contents, travelRoute_id } = postPostsDto;
      const newPost = this.postRepository.create({
        user_id: 11, // fix. 토큰으로 유저번호 받아야함
        title,
        contents,
        travelRoute_id
      });

      return await this.postRepository.save(newPost);
    } catch (error) {
      throw new HttpException('삐빅 데이터베이스 쿼리 Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } 

  async modifyPost(postPostsDto: PostPostsDto) {
    try {
      const { title, contents, travelRoute_id, post_id } = postPostsDto;
      const post = await this.postRepository.findOne({ where: { id: post_id }})
      if (!post) {
        throw new HttpException('그런 게시글은 없어용~', HttpStatus.NOT_FOUND);
      }
      post.title = title;
      post.contents = contents;
      post.travelRoute_id = travelRoute_id;
      return await this.postRepository.save(post);

    } catch (error) {
      throw new HttpException('삐빅 데이터베이스 쿼리 Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePost(id: number) {
    try {
      const result = await this.postRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('삭제 실패! 그런거없음!', HttpStatus.NOT_FOUND);
      }
      return "Success";
    } catch (error) {
      throw new HttpException('응 안돼~', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async likePost(post_id: number, user_id: number) {
    try {
      const post = await this.postRepository.findOne({ where: { id: post_id } });
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
  
      const user = await this.userRepository.findOne({ where: { id: user_id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      const existingLike = await this.likeRepository.findOne({ where: { user, post } });
      if (existingLike) {
        throw new HttpException('Post already liked', HttpStatus.CONFLICT);
      }
  
      const like = this.likeRepository.create({ user_id: user.id, post_id: post.id });
      return await this.likeRepository.save(like);
  
    } catch (error) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async unlikePost(post_id: number, user_id: number) {
    try {
      const post = await this.postRepository.findOne({ where: { id: post_id } });
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      const user = await this.userRepository.findOne({ where: { id: user_id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const existingLike = await this.likeRepository.findOne({ where: { user, post } });
      if (!existingLike) {
        throw new HttpException('Like not found', HttpStatus.NOT_FOUND);
      }

      await this.likeRepository.remove(existingLike);
      return { message: '좋아요 캇ㅌ' };
      
    } catch (error) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
