import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async sendEmail(@Body('text') text: string) {
    try {
      await this.mailService.sendMail(text);
      return {
        message: '성공적으로 문의를 넣었습니다.',
      };
    } catch (error) {
      throw new HttpException(
        error.message || '소원수리함 에러',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
