import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private S3Service: S3Service,
  ) {}

  @Get('/search')
  async searchUsers(@Query() searchData: SearchUserDto) {
    const { name, page, limit } = searchData;
    const searchResult = await this.userService.searchUserByName(
      name,
      page,
      limit,
    );
    return searchResult;
  }

  @Get('/:id')
  async getUserDetail(@Param('id') userId: number) {
    return this.userService.getUserDetail(userId);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('profileImg'))
  async replaceUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() replaceData: UpdateUserDto,
    @Req() req: Request,
  ) {
    let imgUrl: string;
    let userName: string;
    if (file) {
      imgUrl = await this.S3Service.uploadSingleFile(file);
    }

    if (replaceData.userName) {
      userName = replaceData.userName;
    }

    await this.userService.replaceUserInfoById(req.user.id, imgUrl, userName);

    //이미지나 닉네임이 없을때
    if (!imgUrl && !userName) {
      throw new BadRequestException('필요한 데이터가 없습니다');
    }

    return {
      message: '정보 변경 완료',
      profileImg: imgUrl && imgUrl,
      nickName: userName && userName,
    };
  }
}

// const defaultImg =
// 'http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640';
