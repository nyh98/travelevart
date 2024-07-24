import { Injectable } from '@nestjs/common';
import { CreateCustomDto } from './dto/create-custom.dto';
import { UpdateCustomDto } from './dto/update-custom.dto';

@Injectable()
export class CustomService {
  create(createCustomDto: CreateCustomDto) {
    return 'This action adds a new custom';
  }

  findAll() {
    return `This action returns all custom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} custom`;
  }

  update(id: number, updateCustomDto: UpdateCustomDto) {
    return `This action updates a #${id} custom`;
  }

  remove(id: number) {
    return `This action removes a #${id} custom`;
  }
}
