import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { Alert } from 'src/alert/entities/alert.entity';


@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Alert)
        private readonly alertRepository: Repository<Alert>,
    ) {}

    async getComments(postId: number, page: number = 1) {
        const pageSize = 5;
        try {
            const [comments, total] = await this.commentRepository.createQueryBuilder('comment')
                .leftJoinAndSelect('comment.user', 'user') // 유저 정보를 조인
                .where('comment.post_id = :postId', { postId }) // 파라미터를 명확히 설정
                .orderBy('comment.created_at', 'DESC')
                .select([
                    'comment.id',
                    'comment.contents',
                    'comment.created_at',
                    'user.id',
                    'user.user_name',
                    'user.profile_img',
                ])
                .skip((page - 1) * pageSize) // 페이지네이션을 위한 offset 설정
                .take(pageSize) // 페이지네이션을 위한 limit 설정
                .getManyAndCount(); // 총 댓글 수를 함께 가져옴
    
            // 결과 매핑
            const formattedComments = comments.map(comment => ({
                id: comment.id,
                authorId: comment.user.id,
                author: comment.user.user_name,
                profileImg: comment.user.profile_img,
                comment: comment.contents,
                created_at: comment.created_at,
            }));
    
            return {
                comments: formattedComments,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error) {
            console.error('Error in getComments:', error); // 에러 로그 추가
            throw new HttpException(`GET /comments/:postId 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createComment(postId: number, contents: string, userId: number) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId }});
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            const post = await this.postRepository.findOne({ where: { id: postId } });
            if (!post) {
              throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }
        
            const comment = this.commentRepository.create({
                contents: contents,
                user_id: userId,
                post_id: postId
            })

            await this.commentRepository.save(comment);


            // if 소켓에 연결 되어 있지 않다면,
            // {}
            // else 
            // 알림 생성 로직 추가
            if (post.user_id != userId) {
                const alert = this.alertRepository.create({
                    rec_user_id: post.user_id,  // 게시글 작성자를 알림의 수신자로 설정
                    send_user_id: userId,  // 댓글 작성자를 알림의 발신자로 설정
                    type: 'comment',  // 알림 타입을 'comment'로 설정
                    comment_id: comment.id,  // 참조 ID를 생성된 댓글의 ID로 설정
                });

                await this.alertRepository.save(alert);
            }
            
            return {
                message: "댓글 작성이 완료되었습니다."
            }
        } catch (error) {
            console.error('Error in getComments:', error); // 에러 로그 추가
            throw new HttpException(`POST /comments/:postId 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async modifyComment(commentId: number, contents: string, userId: number) {
        try {
            const comment = await this.commentRepository.findOne({ where: { id: commentId }})
            if (!comment) {
                throw new HttpException('그런 댓글은 없어용~', HttpStatus.NOT_FOUND);
            }

            if (comment.user_id === userId) {
                comment.contents = contents;
                await this.commentRepository.save(comment);
                return { message: '댓글이 성공적으로 수정되었습니다.' };      
            }  else {
                throw new HttpException('댓글을 수정할 권한이 없습니다.', HttpStatus.FORBIDDEN);
            }
        } catch (error) {
            console.error('Error in getComments:', error); // 에러 로그 추가
            throw new HttpException(`PATCH /comments/:commentId 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteComment(commentId: number, userId: number) {
        try {
            const comment = await this.commentRepository.findOne({ where: { id: commentId }})
            if (!comment) {
                throw new HttpException('그런 댓글은 없어용~', HttpStatus.NOT_FOUND);
            }

            if (comment.user_id === userId) {
                await this.commentRepository.remove(comment);
                return { message: '댓글이 성공적으로 삭제되었습니다.' };
            } else {
                throw new HttpException('댓글을 삭제할 권한이 없습니다.', HttpStatus.FORBIDDEN);
            }
        } catch (error) {
            throw new HttpException(`DELETE /comments/:commentId - ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}