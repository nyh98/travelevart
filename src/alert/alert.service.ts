import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';
import { Post } from 'src/post/entities/post.entity';
import { Postlike } from 'src/post/entities/postlike.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
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
    try {
      const alerts = await this.alertRepository.find({
        where: { rec_user_id: userId },
        relations: ['sendUser', 'postlike', 'postlike.post', 'comment', 'comment.post', 'travelRoute'],
        order: {
          created_at: 'DESC',
        },
      });
  
      const formattedAlerts = alerts.map(alert => {
        let message = '';
        let title = '';
  
        if (alert.type === 'like' && alert.postlike) {
          title = alert.postlike.post.title;
        } else if (alert.type === 'comment' && alert.comment) {
          title = alert.comment.post.title;
        } else if (alert.type === 'fork' && alert.travelRoute) {
          title = alert.travelRoute.travelName;
        }
  
        switch (alert.type) {
          case 'comment':
            message = `${alert.sendUser.user_name} 님이 ${title}에 댓글을 남겼습니다.`;
            break;
          case 'like':
            message = `${alert.sendUser.user_name} 님이 ${title}에 좋아요를 눌렀습니다.`;
            break;
          case 'fork':
            message = `${alert.sendUser.user_name} 님이 ${title}을(를) 포크하였습니다.`;
            break;
          default:
            message = '알 수 없는 알림 타입입니다.';
        }
  
        return {
          alertId: alert.id,
          profileImage: alert.sendUser.profile_img,  // 프로필 이미지
          nickname: alert.sendUser.user_name,  // 닉네임
          type: alert.type,  // 알림 타입
          title: title,  // 게시글 제목 (optional)
          Contents: alert.type === 'comment' ? alert.comment.contents : null,  // 댓글 내용 (optional)
          message: message,  // 최종 메시지
        };
      });
      return formattedAlerts;
    } catch (error) {
      console.error('Error in getAlert:', error);
      throw new HttpException('알림 데이터를 가져오는 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async deleteAlert(alertId: number, userId: number) {
    try {
      const alert = await this.alertRepository.findOne({
        where: { id: alertId, rec_user_id: userId },
      });
  
      if (!alert) {
        throw new HttpException('알림을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }
  
      await this.alertRepository.remove(alert);
      return { message: '알림이 삭제되었습니다.' };
    } catch (error) {
      console.error('Error in deleteAlert:', error);
      throw new HttpException('알림 삭제 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAllAlerts(userId: number) {
    try {
      await this.alertRepository.delete({ rec_user_id: userId });
      return { message: '모든 알림이 삭제되었습니다.' };
    } catch (error) {
      console.error('Error in deleteAllAlerts:', error);
      throw new HttpException('모든 알림 삭제 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}