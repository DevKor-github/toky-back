import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { TicketEntity } from 'src/ticket/entities/ticket.entity';
import { TicketModule } from 'src/ticket/ticket.module';
import { BetsModule } from 'src/bets/bets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TicketEntity]),
    TicketModule,
    BetsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
