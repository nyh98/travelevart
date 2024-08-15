import { Controller, Post, Patch, Body, Param, Req, Res, HttpStatus, HttpException, Get, Delete, Query } from '@nestjs/common';
import { CreateTravelRouteDto } from './dto/create-travelroute.dto';
import { CreateDetailTravelItemDto, UpdateDetailTravelDto } from './dto/update-detailtravel.dto';
import { Request, Response } from 'express';
import { TravelRouteService } from './custom.service';

@Controller('travelroutes')
export class TravelRouteController {
  constructor(
    private readonly travelRouteService: TravelRouteService,
  ) {}

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
      console.log(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

  
  // TravelRoute 수정
  @Patch(':travelrouteId')
  async updateTravelRoute(
      @Param('travelrouteId') travelrouteId: number,
      @Body() updateTravelRouteDto: {  
        travelName?: string, 
        travelrouteRange?: number, 
        startDate?: Date, 
        endDate?: Date, 
        transportOption?: string  
      },
      @Req() req: Request,
      @Res() res: Response,
  ) {
      try {
          const user = req.user; 
          if (!user) {
              throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
          const result = await this.travelRouteService.updateTravelRoute(travelrouteId, updateTravelRouteDto);
          return res.status(HttpStatus.OK).json(result);
      } catch (error) {
          if (error instanceof HttpException) {
              return res.status(error.getStatus()).json({ message: error.message });
          }
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
      }
  }

  // DetailTravel 수정
  @Patch(':detailtravelId/details')
  async updateDetailTravel(
    // @Query('travelrouteId') travelrouteId: number,
    // @Query('detailtravelId') detailtravelId: number,
    @Param('detailtravelId') detailtravelId: number,
    @Body() detail: UpdateDetailTravelDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
      try {
          const user = req.user;
          if (!user) {
              throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
          const result = await this.travelRouteService.updateDetailTravel(detailtravelId, detail);
          return res.status(HttpStatus.OK).json(result);
      } catch (error) {
        if (error instanceof HttpException) {
              return res.status(error.getStatus()).json({ message: error.message });
            }
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
        }
  }

  // TravelRoute 조회
  @Get(':userId')
  async getTravelRoute(
      @Param('userId') userId: number,
      @Req() req: Request,
      @Res() res: Response,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
          const result = await this.travelRouteService.getTravelRoute(userId);
          return res.status(HttpStatus.OK).json(result);
        } catch (error) {
          if (error instanceof HttpException) {
            return res.status(error.getStatus()).json({ message: error.message });
          }
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
      }
    }

  // DetailTravel 조회
  @Get(':travelrouteId/details')
  async getDetailTravel(
    @Param('travelrouteId') travelrouteId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
      try {
          const user = req.user;
          if (!user) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
          const result = await this.travelRouteService.getDetailTravel(travelrouteId);
          return res.status(HttpStatus.OK).json(result);
        } catch (error) {
          if (error instanceof HttpException) {
              return res.status(error.getStatus()).json({ message: error.message });
          }
          console.log(error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
      }
  }

  // TravelRoute 삭제
  @Delete(':travelrouteId')
  async deleteTravelRoute(
      @Param('travelrouteId') travelrouteId: number,
      @Req() req: Request,
      @Res() res: Response,
  ) {
      try {
          const user = req.user;
          if (!user) {
              throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
          await this.travelRouteService.deleteTravelRoute(travelrouteId);
          return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
          if (error instanceof HttpException) {
            return res.status(error.getStatus()).json({ message: error.message });
          }
          console.log(error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
        }
  }

  // DetailTravel 삭제
  @Delete(':detailtravelId/details')
  async deleteDetailTravel(
    // @Query('travelrouteId') travelrouteId: number,
    // @Query('detailtravelId') detailtravelId: number,
    @Param('detailtravelId') detailtravelId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
          const user = req.user;
          if (!user) {
              throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
          await this.travelRouteService.deleteDetailTravel(detailtravelId);
          return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
          if (error instanceof HttpException) {
              return res.status(error.getStatus()).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
          }
  }  
  
  @Post('fork/:postId')
  async forkPost(
    @Param('postId') postId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const fork = await this.travelRouteService.forkPost(req.user.id, postId);
      return res.status(HttpStatus.CREATED).json(fork);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

  
  @Post('recommendations')
  async saveRecommendedRoute(
    @Body() createTravelRouteDto: CreateTravelRouteDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {

    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      }

      const result = await this.travelRouteService.saveRecommendedRoute(
        createTravelRouteDto,
        user.id,
      );
      
      return res.status(HttpStatus.OK).json(result);
    }
     catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

  @Post(':travelRouteId')
  async addDetailToTravelRoute(
    @Param('travelRouteId') travelRouteId: number,
    @Body() updateDetailTravelDto: UpdateDetailTravelDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const detailTravels = await this.travelRouteService.addDetailToTravelRoute(travelRouteId, updateDetailTravelDto);
      return res.status(HttpStatus.OK).json(detailTravels);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      console.log(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

}
