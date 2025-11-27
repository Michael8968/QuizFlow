import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

export interface FindManyOptions {
  where?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

/**
 * 基础 Repository 类
 * 提供通用的 CRUD 操作
 */
export abstract class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly supabase: SupabaseClient,
    protected readonly tableName: string,
  ) {}

  /**
   * 根据 ID 查找单条记录
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw error;
    }
    return data;
  }

  /**
   * 查找多条记录
   */
  async findMany(options?: FindManyOptions): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select('*');

    if (options?.where) {
      for (const [key, value] of Object.entries(options.where)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? false,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset !== undefined && options?.limit) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * 带分页的查询
   */
  async findManyPaginated(options?: FindManyOptions): Promise<PaginatedResult<T>> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (options?.where) {
      for (const [key, value] of Object.entries(options.where)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? false,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset !== undefined && options?.limit) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * 创建记录
   */
  async create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<T, 'id'>>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(entity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 更新记录
   */
  async update(id: string, entity: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(entity)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 删除记录
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * 批量查询
   */
  async findByIds(ids: string[]): Promise<T[]> {
    if (ids.length === 0) return [];

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  }

  /**
   * 检查记录是否存在
   */
  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('id', id)
      .single();

    if (error && this.isNotFoundError(error)) return false;
    if (error) throw error;
    return !!data;
  }

  /**
   * 判断是否为"记录不存在"错误
   */
  protected isNotFoundError(error: PostgrestError): boolean {
    return (
      error.code === 'PGRST116' ||
      error.message?.includes('No rows') ||
      error.details?.includes('0 rows')
    );
  }
}
