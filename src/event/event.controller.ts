import { Controller, Get, Param } from '@nestjs/common';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getEvents() {
    const events = await this.eventService.getEvents();
    return { events };
  }

  @Get('/:id')
  async getEventDetail(@Param('id') eventId: number) {
    const result = await this.eventService.getDetail(eventId);

    return { item: result };
  }
}
