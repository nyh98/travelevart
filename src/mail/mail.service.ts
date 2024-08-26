import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer'
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: true, // 포트 465번을 사용하는 경우 true
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendMail(text: string) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: this.configService.get<string>('EMAIL_RECEIVER'),
        subject: "문의 메일",
        text,
      };

      return this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error :', error); // 에러 로그 추가
      throw new HttpException(`POST /mail (소원수리함) 에러입니다. ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    };
  }
}
