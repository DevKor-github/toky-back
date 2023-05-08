import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BetsModule } from './bets/bets.module';
import { PointsModule } from './points/points.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'seokwon',
      password: 'postgres',
      database: 'toky',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    BetsModule,
    PointsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
