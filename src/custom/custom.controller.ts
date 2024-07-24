import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomService } from './custom.service';
import { CreateCustomDto } from './dto/create-custom.dto';
import { UpdateCustomDto } from './dto/update-custom.dto';

@Controller('custom')
export class CustomController {
  constructor(private readonly customService: CustomService) {}

  @Post()
  create(@Body() createCustomDto: CreateCustomDto) {
    return this.customService.create(createCustomDto);
  }

  @Get()
  findAll() {
    return this.customService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomDto: UpdateCustomDto) {
    return this.customService.update(+id, updateCustomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customService.remove(+id);
  }
}
