import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { JwtService } from '../common/jwt.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // 检查用户是否已存在
    const { data: existingUser } = await this.supabaseService
      .getClient()
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictException('用户已存在');
    }

    // 创建 Supabase 用户
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth
      .signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('用户创建失败');
    }

    // 在数据库中创建用户记录
    const userData = {
      id: authData.user.id,
      email: authData.user.email!,
      name: name,
      role: 'teacher',
      plan: 'free',
    };

    const user = await this.supabaseService.createUser(userData);

    // 生成 JWT token
    const accessToken = await this.jwtService.generateAccessToken(user.id, user.email);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 验证用户凭据
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth
      .signInWithPassword({
        email,
        password,
      });

    if (authError) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (!authData.user) {
      throw new UnauthorizedException('登录失败');
    }

    // 获取用户信息，如果不存在则创建
    let user = await this.supabaseService.getUserById(authData.user.id);
    
    if (!user) {
      // 如果用户记录不存在，创建用户记录
      const userData = {
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || '用户',
        role: 'teacher',
        plan: 'free',
      };
      user = await this.supabaseService.createUser(userData);
    }

    // 生成 JWT token
    const accessToken = await this.jwtService.generateAccessToken(user.id, user.email);

    return {
      user,
      accessToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.supabaseService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  async refreshToken(userId: string) {
    const user = await this.supabaseService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const accessToken = await this.jwtService.generateAccessToken(user.id, user.email);
    return { accessToken };
  }
}
