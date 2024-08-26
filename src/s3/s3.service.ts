import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private Buket = this.ConfigService.get<string>('AWS_S3_BUCKET_NAME');
  private cloudFrontUrl = this.ConfigService.get<string>('CLOUDFRONT_URL');

  constructor(private ConfigService: ConfigService) {
    this.s3 = new S3Client({
      region: this.ConfigService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.ConfigService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.ConfigService.get('AWS_SECRET_KEY'),
      },
    });
  }

  async uploadSingleFile(file: Express.Multer.File) {
    const key = `travelevart/${Date.now().toString()}-${file.originalname}`;

    const params = {
      Key: key,
      Body: file.buffer,
      Bucket: this.Buket,
      ACL: ObjectCannedACL.public_read,
    };

    const command = new PutObjectCommand(params);

    const uploadFileS3 = await this.s3.send(command);

    if (uploadFileS3.$metadata.httpStatusCode !== 200) {
      throw new BadRequestException('파일 업로드에 실패했습니다');
    }

    const imgUrl = `${this.cloudFrontUrl}/${key}`;
    return imgUrl;
  }

  async deleteFile(imgUrl: string) {
    const key = imgUrl.replace(this.cloudFrontUrl + '/', '');

    if (key) {
      const command = new DeleteObjectCommand({
        Bucket: this.Buket,
        Key: key
      });

      await this.s3.send(command);
    }
  }
}
