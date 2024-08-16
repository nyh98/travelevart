import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Fork } from 'src/custom/entities/fork.entity';
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
    @InjectRepository(Fork)
    private readonly forkRepository: Repository<Fork>
  ) {}

  async getAlert(userId: number) {
    try {
      // 사용자가 작성한 모든 게시물의 ID를 가져오는 쿼리
      const userPosts = await this.postRepository
        .createQueryBuilder('post')
        .select('post.id')
        .where('post.user_id = :userId', { userId })
        .getMany();

      const postIds = userPosts.map(post => post.id);

      const forkPosts = await this.forkRepository
        .createQueryBuilder('fork')
        .select('fork.travelroute_id')  // travelroute_id를 선택
        .where('fork.user_id = :userId', { userId })
        .getMany();

      const forkIds = forkPosts.map(fork => fork.travelroute_id);

      if (postIds.length === 0 && forkIds.length === 0) {
        return {
            alerts: [],
            alertsCount: 0,
        };
      }

      let commentAlerts = []
      let likeAlerts = []
      let forkAlerts = []

      if ( postIds.length > 0 ) {
        // 댓글 알림 쿼리
        commentAlerts = await this.commentRepository.createQueryBuilder('comment')
          .select([
            'user.profile_img AS userImage',
            'user.user_name AS userNickname',
            "'댓글' AS alertType",
            'post.title AS AlertName',
            'comment.contents AS contents',
            'comment.created_at AS created_at'
          ])
          .leftJoin('comment.user', 'user')
          .leftJoin('comment.post', 'post')
          .where('comment.post_id IN (:...postIds)', { postIds })
          .andWhere('comment.check = false')
          .getRawMany();

        // 좋아요 알림 쿼리
        likeAlerts = await this.postlikeRepository.createQueryBuilder('postlike')
          .select([
            'user.profile_img AS userImage',
            'user.user_name AS userNickname',
            "'좋아요' AS alertType",
            'post.title AS AlertName',
            "'새로운 좋아요가 있습니다.' AS contents",
            'postlike.created_at AS created_at'
          ])
          .leftJoin('postlike.user', 'user')
          .leftJoin('postlike.post', 'post')
          .where('postlike.post_id IN (:...postIds)', { postIds })
          .andWhere('postlike.check = false')
          .getRawMany();
      }

      if ( forkIds.length > 0 ) {
        // 포크 알림 쿼리
        forkAlerts = await this.forkRepository.createQueryBuilder('fork')
        .select([
          'user.profile_img AS userImage',
          'user.user_name AS userNickname',
          "'포크' AS alertType",
          'travelroute.travelName AS AlertName',
          "'새로운 포크가 있습니다.' AS contents",
          'fork.created_at AS created_at'
        ])
        .leftJoin('fork.user', 'user')
        .leftJoin('fork.travelroute', 'travelroute')
        .where('fork.travelroute_id IN (:...forkIds)', { forkIds })
        .andWhere('fork.check = false')
        .getRawMany();
      }

      // 두 쿼리 결과를 합치고 최신순으로 정렬
      const alerts = [...commentAlerts, ...likeAlerts, ...forkAlerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // 최신순으로 정렬된 데이터 반환
      return {
        alerts: alerts,
        alertsCount: alerts.length,
      };
    } catch (error) {
      console.error('Error in getComments:', error); // 에러 로그 추가
      throw new HttpException(`GET /alert 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkAlert(userId: number) {
    try {
      const userPosts = await this.postRepository
        .createQueryBuilder('post')
        .select('post.id')
        .where('post.user_id = :userId', { userId })
        .getMany();

      const postIds = userPosts.map(post => post.id);

      const forkPosts = await this.forkRepository
        .createQueryBuilder('fork')
        .select('fork.travelroute_id')  // travelroute_id를 선택
        .where('fork.user_id = :userId', { userId })
        .getMany();

      const forkIds = forkPosts.map(fork => fork.travelroute_id);

      if (postIds.length > 0) {
        // comment 테이블 업데이트
        await this.commentRepository.createQueryBuilder()
            .update(Comment)
            .set({ check: true })
            .where('post_id IN (:...postIds) AND check = false', { postIds })
            .execute();

        // postlike 테이블 업데이트
        await this.postlikeRepository.createQueryBuilder()
            .update(Postlike)
            .set({ check: true })
            .where('post_id IN (:...postIds) AND check = false', { postIds })
            .execute();
    }

    if (forkIds.length > 0) {
        // fork 테이블 업데이트
        await this.forkRepository.createQueryBuilder()
            .update(Fork)
            .set({ check: true })
            .where('travelroute_id IN (:...forkIds) AND check = false', { forkIds })
            .execute();
    }

      return { message: '알림이 확인되었습니다.' };
    } catch (error) {
      console.error('Error in markAlertsAsRead:', error); // 에러 로그 추가
      throw new HttpException(`PATCH /alerts 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
