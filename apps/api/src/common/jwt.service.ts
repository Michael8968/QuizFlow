import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(
    private configService: ConfigService,
    private jwtService: NestJwtService,
  ) {}

  async generateToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async generateAccessToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'refresh' };
    return this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });
  }
}
