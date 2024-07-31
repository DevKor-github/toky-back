import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawEntity } from './entities/draw.entity';
import { GiftEntity } from './entities/gift.entity';
import { HistoryEntity } from './entities/history.entity';
import { TicketEntity } from './entities/ticket.entity';
import { HistoryService } from './history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DrawEntity,
      GiftEntity,
      HistoryEntity,
      TicketEntity,
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService, HistoryService],
})
export class TicketModule {}
