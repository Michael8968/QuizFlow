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
    
    if (error) throw error;
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
      .select(`
        *,
        questions:questions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createPaper(paperData: any) {
    const { data, error } = await this.supabase
      .from('papers')
      .insert(paperData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePaper(id: string, paperData: any) {
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
