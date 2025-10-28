import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '用户密码', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: '密码至少需要6个字符' })
  password: string;

  @ApiProperty({ description: '用户姓名', example: '张三' })
  @IsString()
  name: string;
}

export class LoginDto {
  @ApiProperty({ description: '用户邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '用户密码', example: 'password123' })
  @IsString()
  password: string;
}
