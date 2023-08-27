import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const reqTimeStamp = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });
    console.log(`[${reqTimeStamp}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    res.on('finish', () => {
      const resTimeStamp = new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      });
      console.log(
        `[${resTimeStamp}] ${req.method} ${req.url} at ${reqTimeStamp}`,
      );
      console.log('status:', res.statusCode);
      console.log('Headers:', res.getHeaders());
    });
    next();
  }
}
