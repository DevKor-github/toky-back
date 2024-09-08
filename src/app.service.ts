import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! dev 서버 이관';
  }

  async healthCheck(): Promise<number> {
    const res = await fetch(process.env.DOMAIN);
    console.log(res);
    if (res.ok) {
      return 200;
    } else {
      return 500;
    }
  }
}
