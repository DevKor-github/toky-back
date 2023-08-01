import { Module } from '@nestjs/common';
import { CheersService } from './cheers.service';
import { CheersController } from './cheers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheerEntity } from 'src/cheers/entities/cheer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheerEntity])],
  providers: [CheersService],
  controllers: [CheersController],
})
export class CheersModule {}
