import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event) private eventRepository: Repository<Event>,
  ) {}

  async getEvents() {
    return this.eventRepository
      .createQueryBuilder('event')
      .select([
        'event.id',
        'event.startDay',
        'event.endDay',
        'event.region',
        'event.title',
        'event.image',
      ])
      .getMany();
  }

  async getDetail(eventId: number) {
    if (isNaN(eventId)) {
      return null;
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (event) {
      this.eventRepository.save({ ...event, viewCount: event.viewCount + 1 });
    }

    return event;
  }
}
