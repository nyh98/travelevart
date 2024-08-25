import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

// 게시글 조회 Req
export class GetPostsDto {
    @IsString()
    @IsOptional()
    target?: string;

    @IsString()
    @IsOptional()
    searchName?: string;

    @IsNumberString()
    @IsOptional()
    page?: string;

    @IsNumberString()
    @IsOptional()
    pageSize?: string
}

export class CreatePostContentDto  {
    @IsString()
    @IsNotEmpty()
    text: string;
  
    @IsString()
    @IsOptional()
    image?: string;

    @IsNumber()
    @IsOptional()
    detailtravel_id?: string;

    @IsNumber()
    @IsOptional()
    imageIndex?: number; // imageIndex 속성 추가
}

// 게시글 작성 및 수정
export class PostPostsDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @Type(() => CreatePostContentDto)
    @IsOptional()
    contents?: CreatePostContentDto[];

    @IsOptional()
    @IsString()
    travelRoute_id: string;

    @ValidateIf((o) => o.post_id !== undefined)
    @IsNumber()
    @IsOptional()
    post_id: number;
}

export interface PostContentDto {
    id: number;
    postId: number;
    order: number;
    text: string;
    image: string;
}

// 게시글 조회 Res
export interface PostDetailDto {
    id: number;
    author: string;
    authorId: number;
    profileImg: string;
    title: string;
    views: number;
    commentCount: number;
    created_at: Date;
    travelRoute_id: number;
    like: number;
    detailTravels: DetailTravelDto[];
    contents?: PostContentDto[];
    isLiked?: boolean;
}

// 게시글 조회 Res
export interface PopularPostDetailDto {
    id: number;
    author: string;
    profileImg: string
    title: string;
    detailTravels: DetailTravelDto[];
    contents?: PostContentDto[];
}

export interface DetailTravelDto {
    image: string;
}