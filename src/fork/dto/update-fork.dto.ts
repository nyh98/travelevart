import { PartialType } from '@nestjs/mapped-types';
import { CreateForkDto } from './create-fork.dto';

export class UpdateForkDto extends PartialType(CreateForkDto) {}
