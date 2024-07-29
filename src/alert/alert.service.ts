import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { Postlike } from 'src/post/entities/postlike.entity';
import { User } from 'src/user/entities/user.entity';
import { In, Repository } from 'typeorm';

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

      if (postIds.length === 0) {
        return {
          alerts: [],
          alertsCount: 0,
        };
      }

      // 댓글과 좋아요 데이터를 한 번의 쿼리로 가져오기
      const alerts = await this.postRepository.query(`
        SELECT 
          user.profile_img AS userImage,
          user.user_name AS userNickname,
          '댓글' AS alertType,
          post.title AS postName,
          comment.contents AS contents, 
          comment.created_at AS created_at
        FROM comment 
        LEFT JOIN user ON comment.user_id = user.id
        LEFT JOIN post ON comment.post_id = post.id
        WHERE comment.post_id IN (?) AND comment.check = false
        UNION ALL
        SELECT 
          user.profile_img AS userImage, 
          user.user_name AS userNickname, 
          '좋아요' AS alertType, 
          post.title AS postName,
          '새로운 좋아요가 있습니다.' AS contents, 
          postlike.created_at AS created_at   
        FROM postlike 
        LEFT JOIN user ON postlike.user_id = user.id
        LEFT JOIN post ON postlike.post_id = post.id
        WHERE postlike.post_id IN (?) AND postlike.check = false
        ORDER BY created_at DESC
      `, [postIds, postIds]);

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

      return { message: '알림이 확인되었습니다.' };
    } catch (error) {
      console.error('Error in markAlertsAsRead:', error); // 에러 로그 추가
      throw new HttpException(`PATCH /alerts 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
