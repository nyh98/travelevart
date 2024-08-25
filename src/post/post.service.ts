import { ConsoleLogger, HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DataSource, IsNull, Like, Not, Repository } from 'typeorm';
import { GetPostsDto, PopularPostDetailDto, PostDetailDto, PostPostsDto } from './dto/post.dto';
import { Postlike } from './entities/postlike.entity';
import { Post } from './entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { RedisService } from 'src/redis/redis.service';
import { Postcontent } from './entities/postcontent.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';
import { Alert } from 'src/alert/entities/alert.entity';
import { AlertGateway } from 'src/alert/alert.gateway';

@Injectable()
export class PostService implements OnModuleInit {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
    @InjectRepository(Postlike)
    private readonly likeRepository: Repository<Postlike>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Postcontent)
    private readonly postcontentRepository: Repository<Postcontent>,
    @InjectRepository(TravelRoute)
    private readonly travelRouteRepository: Repository<TravelRoute>,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly alertGateway: AlertGateway
  ) {}

  async onModuleInit() {
    await this.updatePopularPosts();
  }

  async getMypagePosts(userId: number) {
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoin('post.comment', 'comment') // 댓글과 조인
      .leftJoin('post.postlike', 'postlike') // 좋아요와 조인
      .where('post.user_id = :userId', { userId })
      .addSelect('COUNT(DISTINCT comment.id)', 'commentCount') // 댓글 수 계산
      .addSelect('COUNT(DISTINCT postlike.id)', 'likeCount') // 좋아요 수 계산
      .groupBy('post.id') // 게시물별로 그룹화
      .orderBy('post.created_at', 'DESC');

    const posts = await qb.getRawAndEntities();

    return posts.entities.map((post, index) => ({
      ...post,
      commentCount: parseInt(posts.raw[index].commentCount, 10) || 0,
      likeCount: parseInt(posts.raw[index].likeCount, 10) || 0,
    }));
  }

  // 일반 게시물 조회
  async getPosts(query: GetPostsDto, userId:number | null): Promise<{ posts: PostDetailDto[]; currentPage: number, totalPage: number }> {
    let { target, searchName, page, pageSize } = query;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSizeNumber = page ? parseInt(pageSize, 10) : 10;

    if (!target) {
      target = '여행게시판';
    }

    // 조건 설정
    const whereCondition: any = {};
    if (target === '여행게시판') {
      whereCondition.travelRoute_id = Not(IsNull());
    } else if (target === '자유게시판') {
      whereCondition.travelRoute_id = IsNull();
    }

    if (searchName && searchName.trim() !== '') {
      whereCondition.title = Like(`%${searchName}%`);
    }

    // 전체 게시물 개수 가져오기
    const totalPosts = await this.postRepository.count({ where: whereCondition });
    
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoin('post.user', 'user')
      .leftJoin('post.comment', 'comment') // 댓글 수를 계산하기 위한 조인
      .leftJoin('post.postlike', 'postlike') // 좋아요 수를 계산하기 위한 조인
      .leftJoinAndSelect('post.postContents', 'postContents') // 게시물 내용 조인
      .addSelect('user.id')
      .addSelect('user.user_name') // 필요한 유저 정보만 선택
      .addSelect('user.profile_img')
      .addSelect('COUNT(DISTINCT comment.id) AS commentCount') // 댓글 수 계산
      .addSelect('COUNT(DISTINCT postlike.id) AS likeCount') // 좋아요 수 계산
      .groupBy('post.id') // 게시물별로 그룹화
      .addGroupBy('postContents.id') // 그룹화를 postContents.id로 추가
      .orderBy('postContents', 'ASC')

    if (userId) {
      qb.addSelect(`CASE WHEN postlike.user_id = :userId THEN TRUE ELSE FALSE END`, 'isLiked')
        .setParameter('userId', userId);
    }

    if (target === '여행게시판') {
      qb.andWhere('post.travelRoute_id IS NOT NULL');
    } else if (target === '자유게시판') {
      qb.andWhere('post.travelRoute_id IS NULL');
    }

    if (searchName && searchName.trim() !== '') {
      qb.andWhere('post.title LIKE :searchName', { searchName: `%${searchName}%` });
    }

    qb.orderBy('post.created_at', 'DESC');

    // 페이지네이션
    qb.skip((pageNumber - 1) * pageSizeNumber).take(pageSizeNumber);

    try {
      // 쿼리 실행 및 결과 가져오기
      const result = await qb.getRawAndEntities();
      const rawPosts = result.raw;
      const posts = result.entities;
      
      let totalPage = Math.ceil(totalPosts / pageSizeNumber);
      if (totalPage === 0) {
        totalPage = 1;
      }

      // TravelRoute 및 DetailTravels 데이터를 개별적으로 가져오기
      const postDetailPromises = posts.map(async (post, index) => {
        let detailTravels = [];

        if (post.travelRoute_id) {
          const travelRoute = await this.travelRouteRepository.createQueryBuilder('travelroute')
            .leftJoinAndSelect('travelroute.detailTravels', 'detailtravel')
            .where('travelroute.id = :travelRouteId', { travelRouteId: post.travelRoute_id })
            .orderBy('detailtravel.date', 'ASC')
            .getOne();

          detailTravels = travelRoute?.detailTravels ? travelRoute.detailTravels.map(travel => ({
            image: travel.placeImage,
          })) : [];
        }

        return {
          id: post.id,
          author: post.user.user_name,
          authorId: post.user.id,
          profileImg: post.user.profile_img,
          title: post.title,
          views: post.view_count,
          commentCount: parseInt(rawPosts[index].commentCount, 10) || 0,
          created_at: post.created_at,
          travelRoute_id: post.travelRoute_id,
          like: parseInt(rawPosts[index].likeCount, 10) || 0,
          detailTravels: detailTravels,
          contents: post.postContents.map(content => ({
            id: content.id,
            postId: content.post_id,
            order: content.order,
            text: content.contents,
            image: content.contents_img
          })),
          isLiked: rawPosts[index].isLiked == 1
        };
      });
      const postDetails = await Promise.all(postDetailPromises);
      // 응답 데이터 구조화
      return {
        posts: postDetails,
        currentPage: pageNumber,
        totalPage: totalPage,
      };
    } catch (error) {
      console.error('Error :', error); // 에러 로그 추가
      throw new HttpException(`GET /posts (일반 게시물) 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    };
  };

  // 인기 게시물 조회
  async getPopularPosts(target: string): Promise<{ popularPosts: PopularPostDetailDto[]; }> {
    try {
      if (!target) {
        target = '여행게시판';
      }

      let cachedPopularPosts = null;

      if (target === '여행게시판') {
        cachedPopularPosts = await this.redisService.getPopularTravelPostsCache();
      } else if (target === '자유게시판') {
        cachedPopularPosts = await this.redisService.getPopularNormalPostsCache();
      }

      if (cachedPopularPosts) {
        return JSON.parse(cachedPopularPosts);
      }

      // 인기 게시물 계산 로직 (가중치 적용)
      const popularPosts = await this.calculatePopularPosts(target);

      // 캐시 저장 (TTL 1일로 설정)
      if (target === '여행게시판') {
        await this.redisService.setPopularTravelPostsCache(JSON.stringify(popularPosts), 60 * 60 * 24);
      } else if (target === '자유게시판') {
        await this.redisService.setPopularNormalPostsCache(JSON.stringify(popularPosts), 60 * 60 * 24);
      }

      return {
        popularPosts: popularPosts
      }
    } catch (error) {
      console.error('Error :', error); // 에러 로그 추가
      throw new HttpException(`GET /posts (인기 게시물) 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 인기 게시물 계산
  private async calculatePopularPosts(target: string): Promise<PopularPostDetailDto[]> {
    let query = this.postRepository.createQueryBuilder('post')
      .leftJoin('post.postlike', 'postlike')
      .leftJoin('post.user', 'user')
      .leftJoinAndSelect('post.postContents', 'postContents')
      .addSelect('user.user_name')
      .addSelect('user.profile_img')
      .addSelect('COUNT(postlike.id) * 2 + post.view_count AS score')
      .groupBy('post.id')
      .addGroupBy('postContents.id') // 그룹화를 postContents.id로 추가
      .orderBy('score', 'DESC')
      .limit(5);

    if (target === '여행게시판') {
      query = query.andWhere('post.travelRoute_id IS NOT NULL');
    } else if (target === '자유게시판') {
      query = query.andWhere('post.travelRoute_id IS NULL');
    }

    const rawPosts = await query.getRawAndEntities();
    const posts = rawPosts.entities;

    const postDetailPromises = posts.map(async (post, index) => {
      let detailTravels = [];

      if (post.travelRoute_id) {
        const travelRoute = await this.travelRouteRepository.createQueryBuilder('travelroute')
          .leftJoinAndSelect('travelroute.detailTravels', 'detailtravel')
          .where('travelroute.id = :travelRouteId', { travelRouteId: post.travelRoute_id })
          .orderBy('detailtravel.date', 'ASC')
          .getOne();

        detailTravels = travelRoute?.detailTravels ? travelRoute.detailTravels.map(travel => ({
          image: travel.placeImage,
        })) : [];
      }

      return {
        id: post.id,
        author: post.user.user_name,
        profileImg: post.user.profile_img,        
        title: post.title,
        detailTravels: detailTravels,
        contents: post.postContents.map(content => ({
          id: content.id,
          postId: content.post_id,
          order: content.order,
          text: content.contents,
          image: content.contents_img
        })),
      };
    });

    return Promise.all(postDetailPromises);
  }

  // 인기 게시물 업데이트
  async updatePopularPosts() {
    const popularTravelPosts = await this.calculatePopularPosts('여행게시판');
    await this.redisService.setPopularTravelPostsCache(JSON.stringify(popularTravelPosts), 60 * 60 * 24);

    const popularNormalPosts = await this.calculatePopularPosts('자유게시판');
    await this.redisService.setPopularNormalPostsCache(JSON.stringify(popularNormalPosts), 60 * 60 * 24);
  }

  // 게시물 상세 조회
  async getDetailPost(id: number, userId: number | null): Promise<PostDetailDto> {
    try {
      // 조회수를 1 증가시키는 쿼리 실행
      await this.postRepository.increment({ id }, 'view_count', 1);

      const qb = await this.postRepository.createQueryBuilder('post')
        .leftJoin('post.user', 'user')
        .leftJoin('post.comment', 'comment')
        .leftJoin('post.postlike', 'postlike')
        .leftJoinAndSelect('post.postContents', 'postContents')
        .where('post.id = :id', { id })
        .addSelect('user.id')
        .addSelect('user.user_name')
        .addSelect('user.profile_img')
        .addSelect('COUNT(DISTINCT comment.id) AS commentCount')
        .addSelect('COUNT(DISTINCT postlike.id) AS likeCount')
        .addGroupBy('post.id')
        .addGroupBy('user.id')
        .addGroupBy('postContents.id')
        .orderBy('postContents.order', 'ASC');
  
      if (userId) {
        qb.addSelect(`CASE WHEN postlike.user_id = :userId THEN TRUE ELSE FALSE END`, 'isLiked')
          .setParameter('userId', userId);
      }
  
      const result = await qb.getRawAndEntities();
  
      const rawPost = result.raw[0];
      const entityPost = result.entities[0];
  
      if (!rawPost || !entityPost) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
  
      const travelRoute = await this.travelRouteRepository.createQueryBuilder('travelroute')
        .leftJoinAndSelect('travelroute.detailTravels', 'detailtravel')
        .where('travelroute.id = :travelRouteId', { travelRouteId: entityPost.travelRoute_id })
        .orderBy('detailtravel.date', 'ASC')
        .getOne();

  
      return {
        id: entityPost.id,
        author: entityPost.user.user_name,
        authorId: entityPost.user.id,
        profileImg: entityPost.user.profile_img,
        title: entityPost.title,
        views: entityPost.view_count,
        commentCount: parseInt(rawPost.commentCount, 10) || 0,
        created_at: entityPost.created_at,
        travelRoute_id: entityPost.travelRoute_id || 0,
        detailTravels: travelRoute?.detailTravels ? travelRoute.detailTravels.map(travel => ({
          image: travel.placeImage,
        })) : [],
        contents: entityPost.postContents ? entityPost.postContents.map(content => ({
          id: content.id,
          postId: content.post_id,
          order: content.order,
          text: content.contents,
          image: content.contents_img,
          detailtravel_id: content.detailtravel_id
        })) : [],
        like: parseInt(rawPost.likeCount, 10) || 0,
        isLiked: rawPost.isLiked == 1,
      };
    } catch (error) {
      console.error('Error:', error); // 에러 로그 추가
      throw new HttpException(`GET /posts/:id 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createPost(postPostsDto: PostPostsDto, user_id: number) {
    try {
      const { title, contents, travelRoute_id } = postPostsDto;
      let travelRouteIdAsNumber = travelRoute_id ? parseInt(travelRoute_id, 10) : null;
      if (isNaN(travelRouteIdAsNumber)) {
        travelRouteIdAsNumber = null;
      }

      // 새로운 게시물 생성
      const newPost = this.postRepository.create({
        user_id,
        title,
        travelRoute_id : travelRouteIdAsNumber
      });
      const savePost = await this.postRepository.save(newPost);

      // 게시물 내용 저장
      if (contents && contents.length > 0) {
        const postContents = contents.map((content, index) => this.postcontentRepository.create({
          post_id: savePost.id,
          order: index + 1,
          contents: content.text,
          contents_img: content.image,
          detailtravel_id: content.detailtravel_id ? Number(content.detailtravel_id) : null
        }));
        await this.postcontentRepository.save(postContents)
      }

      return {
        message: "게시글 작성이 완료되었습니다."
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('삐빅 데이터베이스 쿼리 Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } 

  async modifyPost(postPostsDto: PostPostsDto) {
    try {
      const { title, contents, travelRoute_id, post_id } = postPostsDto;
      const post = await this.postRepository.findOne({ where: { id: post_id }})
      if (!post) {
        throw new HttpException('게시글이 존재하지 않습니다.', HttpStatus.NOT_FOUND);
      }

      let travelRouteIdAsNumber = travelRoute_id ? parseInt(travelRoute_id, 10) : null;
      if (isNaN(travelRouteIdAsNumber)) {
        travelRouteIdAsNumber = null;
      }

      post.title = title;
      post.travelRoute_id = travelRouteIdAsNumber;

      await this.postcontentRepository.delete({ post_id: post.id });

      if (contents && contents.length > 0) {
        const postContents = contents.map((content, index) => this.postcontentRepository.create({
          post_id: post.id,
          order: index + 1,
          contents: content.text,
          contents_img: content.image
        }));

        await this.postcontentRepository.save(postContents);
      }
      return await this.postRepository.save(post);
    } catch (error) {
      throw new HttpException('삐빅 데이터베이스 쿼리 Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPostContentsByPostId(post_id: number): Promise<Postcontent[]> {
    return await this.postcontentRepository.find({ where: { post_id } });
  }

  async deletePost(id: number) {
    try {
      const result = await this.dataSource.getRepository(Post).delete(id);
      if (result.affected === 0) {
        throw new HttpException('삭제 실패! 그런거없음!', HttpStatus.NOT_FOUND);
      }
      return 'Success';
    } catch (error) {
      console.log(error.message);
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
      const saveedLike = await this.likeRepository.save(like);

      if (post.user_id != user_id) {
        const alert = this.alertRepository.create({
          rec_user_id: post.user_id,  // 게시글 작성자를 알림의 수신자로 설정
          send_user_id: user_id,  // 좋아요한 사용자를 알림의 발신자로 설정
          type: 'like',  // 알림 타입을 'like'로 설정
          postlike_id: saveedLike.id,  // 참조 ID를 생성된 좋아요의 ID로 설정
        });
        await this.alertRepository.save(alert);

        // 전체 알림 수 계산
        const totalAlerts = await this.alertRepository.count({
          where: { rec_user_id: post.user_id },
        });

        // 실시간 알림 전송
        const message = totalAlerts;
        this.alertGateway.sendAlertToUser(post.user_id, message);
      }
      return "좋아요 추가"  
    } catch (error) {
      console.log("좋아요 추가 에러 : ", error);
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