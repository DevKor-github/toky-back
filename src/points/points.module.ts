import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawEntity } from './entities/draw.entity';
import { GiftEntity } from './entities/gift.entity';
import { HistoryEntity } from './entities/history.entity';
import { PointEntity } from './entities/point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DrawEntity,
      GiftEntity,
      HistoryEntity,
      PointEntity,
    ]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
})
export class PointsModule {}
