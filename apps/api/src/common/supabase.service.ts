import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // 用户相关操作
  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // 如果是找不到记录的错误（PostgREST 或 Supabase），返回 null 而不是抛出
      if (error.code === 'PGRST116' || error.message?.includes('No rows') || error.details?.includes('No rows')) {
        return null;
      }
      throw error;
    }
    return data;
  }

  async createUser(userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 题目相关操作
  async getQuestions(userId: string, options?: { page?: number; limit?: number; search?: string }) {
    let query = this.supabase
      .from('questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.search) {
      query = query.or(`content.ilike.%${options.search}%,tags.cs.{${options.search}}`);
    }

    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { data, count };
  }

  async createQuestion(questionData: any) {
    const { data, error } = await this.supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateQuestion(id: string, questionData: any) {
    const { data, error } = await this.supabase
      .from('questions')
      .update(questionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteQuestion(id: string) {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // 试卷相关操作
  async getPapers(userId: string) {
    const { data, error } = await this.supabase
      .from('papers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createPaper(paperData: any) {
    // 如果状态为 published 且没有 quiz_code，自动生成
    if (paperData.status === 'published' && !paperData.quiz_code) {
      paperData.quiz_code = await this.generateUniqueQuizCode();
    }
    
    const { data, error } = await this.supabase
      .from('papers')
      .insert(paperData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePaper(id: string, paperData: any) {
    // 如果状态变为 published 且当前没有 quiz_code，自动生成
    if (paperData.status === 'published') {
      // 先获取当前试卷信息
      const { data: currentPaper } = await this.supabase
        .from('papers')
        .select('quiz_code')
        .eq('id', id)
        .single();

      // 如果当前没有 quiz_code，生成一个
      if (!currentPaper?.quiz_code && !paperData.quiz_code) {
        paperData.quiz_code = await this.generateUniqueQuizCode();
      }
    }
    
    const { data, error } = await this.supabase
      .from('papers')
      .update(paperData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePaper(id: string) {
    const { error } = await this.supabase
      .from('papers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // 生成唯一的考试码
  private generateQuizCode(): string {
    // 生成 6 位大写字母数字组合
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // 生成并确保唯一的考试码
  async generateUniqueQuizCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = this.generateQuizCode();
      
      // 检查代码是否已存在
      const { data, error } = await this.supabase
        .from('papers')
        .select('id')
        .eq('quiz_code', code)
        .single();

      // 如果查询出错（通常是找不到记录），说明代码可用
      if (error && (error.code === 'PGRST116' || error.message?.includes('No rows'))) {
        return code;
      }

      // 如果找到了记录，说明代码已存在，继续尝试
      attempts++;
    }

    // 如果多次尝试都失败，使用时间戳作为后缀
    const baseCode = this.generateQuizCode();
    return `${baseCode.substring(0, 4)}${Date.now().toString().slice(-2)}`;
  }

  async getPaperByCode(quizCode: string) {
    const { data, error } = await this.supabase
      .from('papers')
      .select('*')
      .eq('quiz_code', quizCode)
      .eq('status', 'published')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('No rows') || error.details?.includes('No rows')) {
        return null;
      }
      throw error;
    }
    return data;
  }

  // 答卷相关操作
  async getAnswers(paperId: string) {
    const { data, error } = await this.supabase
      .from('answers')
      .select('*')
      .eq('paper_id', paperId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createAnswer(answerData: any) {
    const { data, error } = await this.supabase
      .from('answers')
      .insert(answerData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateAnswer(id: string, answerData: any) {
    const { data, error } = await this.supabase
      .from('answers')
      .update(answerData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 报告相关操作
  async getReports(userId: string) {
    const { data, error } = await this.supabase
      .from('reports')
      .select(`
        *,
        paper:papers(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createReport(reportData: any) {
    const { data, error } = await this.supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
