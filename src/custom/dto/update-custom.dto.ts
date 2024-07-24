import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomDto } from './create-custom.dto';

export class UpdateCustomDto extends PartialType(CreateCustomDto) {}
