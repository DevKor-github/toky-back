import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! 배포 레알 완 + 카카오 재설정';
  }
}
