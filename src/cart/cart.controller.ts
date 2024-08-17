import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, HttpException, Query, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Request } from 'express';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  
  @Post(':placeId')
  async addCart(
    @Param('placeId') placeId: string,
    @Req() req: Request,
    @Res() response
  ) {
    try {
      const result = await this.cartService.addCart(placeId, req.user.id);
      return response.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error instanceof HttpException) {
        return response.status(error.getStatus()).json({ message: error.message });
      }
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }
    
  @Delete(':placeId')
  async removeCart(
    @Param('placeId') placeId: string,
    @Req() req: Request,
    @Res() response
  ) {
    try {
      await this.cartService.removeCart(placeId, req.user.id);
      return response.status(HttpStatus.OK).json({ message: '찜 취소하기 성공' });
    } catch (error) {
      if (error instanceof HttpException) {
        return response.status(error.getStatus()).json({ message: error.message });
      }
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }

  @Get()
  async getCartDetails(
    @Req() req: Request,
    @Res() response
  ) {
    try {
        const cartItems = await this.cartService.getAllCartItems(req.user.id);
        return response.status(HttpStatus.OK).json(cartItems);
    } catch (error) {
      if (error instanceof HttpException) {
        return response.status(error.getStatus()).json({ message: error.message });
      }
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '서버 에러' });
    }
  }
}
