import { PartialType } from '@nestjs/mapped-types';
import { KakaoAuthDto } from './kakao-auth.dto';

export class UpdateAuthDto extends PartialType(KakaoAuthDto) {}
