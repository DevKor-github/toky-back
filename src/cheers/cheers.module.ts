import { Module } from '@nestjs/common';
import { CheersService } from './cheers.service';
import { CheersController } from './cheers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { CheerEntity } from 'src/cheers/entities/cheer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CheerEntity])],
  providers: [CheersService],
  controllers: [CheersController],
})
export class CheersModule {}
