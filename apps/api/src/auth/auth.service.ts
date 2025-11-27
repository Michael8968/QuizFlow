import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { UserRepository } from './user.repository';
import { JwtService } from '../common/jwt.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import type { User } from '@quizflow/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(createUserDto: CreateUserDto): Promise<{ user: User; accessToken: string }> {
    const { email, password, name } = createUserDto;

    // 检查用户是否已存在
    const emailExists = await this.userRepository.emailExists(email);
    if (emailExists) {
      throw new ConflictException('用户已存在');
    }

    // 创建 Supabase Auth 用户
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
    const user = await this.userRepository.createUser({
      id: authData.user.id,
      email: authData.user.email!,
      name,
      role: 'teacher',
      plan: 'free',
    });

    // 生成 JWT token
    const accessToken = await this.jwtService.generateAccessToken(user.id, user.email);

    return {
      user,
      accessToken,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<{ user: User; accessToken: string }> {
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
    let user = await this.userRepository.findById(authData.user.id);

    if (!user) {
      // 如果用户记录不存在，创建用户记录
      user = await this.userRepository.createUser({
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || '用户',
        role: 'teacher',
        plan: 'free',
      });
    }

    // 生成 JWT token
    const accessToken = await this.jwtService.generateAccessToken(user.id, user.email);

    return {
      user,
      accessToken,
    };
  }

  /**
   * 验证用户
   */
  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  /**
   * 刷新 Token
   */
  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const accessToken = await this.jwtService.generateAccessToken(user.id, user.email);
    return { accessToken };
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 只允许更新特定字段
    const allowedFields = ['name', 'avatar'];
    const updateData: Partial<User> = {};
    for (const field of allowedFields) {
      if (data[field as keyof User] !== undefined) {
        (updateData as Record<string, unknown>)[field] = data[field as keyof User];
      }
    }

    return this.userRepository.update(userId, updateData);
  }
}
