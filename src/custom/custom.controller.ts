import { Controller, Post, Patch, Body, Param, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { CreateTravelRouteDto } from './dto/create-travelroute.dto';
import { UpdateDetailTravelDto } from './dto/update-detailtravel.dto';
import { Request, Response } from 'express';
import { TravelRouteService } from './custom.service';

@Controller('travelroutes')
export class TravelRouteController {
  constructor(private readonly travelRouteService: TravelRouteService) {}

  @Post()
  async createTravelRoute(
    @Req() req: Request,
    @Body() createTravelRouteDto: CreateTravelRouteDto,
    @Res() res: Response,
  ) {
    try {
      const travelRoute = await this.travelRouteService.createTravelRoute(req.user.id, createTravelRouteDto);
      return res.status(HttpStatus.CREATED).json(travelRoute);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

  @Patch(':travelRouteId')
  async addDetailToTravelRoute(
    @Param('travelRouteId') travelRouteId: number,
    @Body() details: UpdateDetailTravelDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req.user; // 미들웨어에서 설정한 유저 정보
      if (!user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const detailTravels = await this.travelRouteService.addDetailToTravelRoute(travelRouteId, details);
      return res.status(HttpStatus.OK).json(detailTravels);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

  @Post('fork/:forkId')
  async forkTravelRoute(
    @Param('forkId') forkId: number,
    @Req() req: Request,
    @Body() createTravelRouteDto: CreateTravelRouteDto,
    @Res() res: Response,
  ) {
    try {
      const travelRoute = await this.travelRouteService.forkTravelRoute(req.user.id, forkId, createTravelRouteDto);
      return res.status(HttpStatus.CREATED).json(travelRoute);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

  @Post('recommend/:recommendationId')
  async recommendTravelRoute(
    @Param('recommendationId') recommendationId: number,
    @Req() req: Request,
    @Body() createTravelRouteDto: CreateTravelRouteDto,
    @Res() res: Response,
  ) {
    try {
      const travelRoute = await this.travelRouteService.recommendTravelRoute(req.user.id, recommendationId, createTravelRouteDto);
      return res.status(HttpStatus.CREATED).json(travelRoute);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }
}
