import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { GetPostsDto, PostDetailDto, PostPostsDto } from './dto/post.dto';
import { Postlike } from './entities/postlike.entity';
import { Post } from './entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
    @InjectRepository(Postlike)
    private readonly likeRepository: Repository<Postlike>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getPosts(query: GetPostsDto): Promise<{ posts: PostDetailDto[]; currentPage: number, totalPage: number }> {
    let { target, searchName, page, pageSize } = query;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;

    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoin('post.comment', 'comment') // 댓글 수를 계산하기 위한 조인
      .leftJoin('post.postlike', 'postlike') // 좋아요 수를 계산하기 위한 조인
      .addSelect('COUNT(DISTINCT comment.id) AS commentCount') // 댓글 수 계산
      .addSelect('COUNT(DISTINCT postlike.id) AS likeCount') // 좋아요 수 계산
      .groupBy('post.id') // 게시물별로 그룹화
      .addGroupBy('user.id'); // 작성자별로 그룹화

    if (!target) {
      target = '전체 게시글';
    }
    if (searchName) {
      target = '전체 게시글';
    }

    try {
      if (target === '전체 게시글') {
        if (searchName && searchName.trim() !== '') {
          qb.andWhere('post.title LIKE :searchName', { searchName: `%${searchName}%` });
        }
        qb.orderBy('post.created_at', 'DESC');
      } else if (target === '인기 여행글') {
        qb.andWhere('post.custom_id IS NOT NULL');
        qb.orderBy('post.custom_id', 'DESC'); // 인기 여행글에 대한 정렬 기준
      } else if (target === '인기 똥글') {
        qb.andWhere('post.custom_id IS NULL');
        qb.orderBy('post.created_at', 'DESC'); // 인기 똥글에 대한 정렬 기준
      }

      // 페이지네이션
      qb.skip((page - 1) * pageSize).take(pageSize);

      // 쿼리 실행 및 결과 가져오기
      const result = await qb.getRawAndEntities();
      const rawPosts = result.raw;
      const posts = result.entities;

      // 전체 페이지 수 계산
      const totalPage = Math.ceil(posts.length / pageSize);

      // 게시물 상세 정보 구성
      const postDetail = rawPosts.map((rawPost, index) => ({
        id: posts[index].id,
        author: posts[index].user.user_name,
        title: posts[index].title,
        views: posts[index].view_count,
        commentCount: parseInt(rawPost.commentCount, 10) || 0, // 조인 결과 사용
        created_at: posts[index].created_at,
        travelRoute_id: posts[index].travelRoute_id, // 커스텀 여행 DB에서 받아서 추가해야됨
        like: parseInt(rawPost.likeCount, 10) || 0, // 조인 결과 사용
      }));

      // 응답 데이터 구조화
      return {
        posts: postDetail,
        currentPage: Number(page),
        totalPage: totalPage,
      };
    } catch (error) {
      console.error('Error in markAlertsAsRead:', error); // 에러 로그 추가
      throw new HttpException(`GET /posts 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    };
  };

  async getDetailPost(id: number): Promise<PostDetailDto> {
    try {
      // 조회수를 1 증가시키는 쿼리 실행
      await this.postRepository.increment({ id }, 'view_count', 1);

      const post = await this.postRepository.createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoin('post.comment', 'comment')
        .leftJoin('post.postlike', 'postlike')
        .where('post.id = :id', { id })
        .addSelect('COUNT(comment.id) AS commentCount')
        .addSelect('COUNT(postlike.id) AS likeCount')
        .groupBy('post.id')
        .addGroupBy('user.id')
        .getRawOne();

      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: post.post_id,
        author: post.user_user_name,
        title: post.post_title,
        views: post.post_view_count + 1, // 이미 증가된 조회수를 반영
        commentCount: parseInt(post.commentCount, 10) || 0,
        created_at: post.post_created_at,
        travelRoute_id: post.post_travelRoute_id || 0,
        contents: post.post_contents,
        like: parseInt(post.likeCount, 10) || 0,
      };
    } catch (error) {
      console.error('Error:', error); // 에러 로그 추가
      throw new HttpException(`GET /posts/:id 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createPost(postPostsDto: PostPostsDto, user_id: number) {
    try {
      const { title, contents, travelRoute_id } = postPostsDto;
      const newPost = this.postRepository.create({
        user_id,
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
