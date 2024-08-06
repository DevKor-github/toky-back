import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PhoneEntity } from 'src/auth/entities/phone.entity';
import { TicketEntity } from 'src/ticket/entities/ticket.entity';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PhoneEntity, TicketEntity]),
    TicketModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
