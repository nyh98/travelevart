import { Controller, Get } from '@nestjs/common';
import * as os from 'os';

@Controller('healthcheck')
export class HealthCheckController {
  @Get()
  check(): string {
    const serverIp = this.getServerIp();
    console.log(`Health check called on server IP: ${serverIp}`);
    return 'OK';
  }

  private getServerIp(): string {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(networkInterfaces)) {
      const networkInterface = networkInterfaces[interfaceName];
      for (const iface of networkInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address; // 서버의 IPv4 주소를 반환
        }
      }
    }
    return 'IP not found';
  }
}