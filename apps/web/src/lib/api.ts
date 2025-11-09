import { createClient } from '@supabase/supabase-js'

// 环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// 验证必需的环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '缺少必需的环境变量：VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。请检查 .env 文件配置。'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API 客户端
class ApiClient {
  private baseUrl = apiUrl

  private getAuthToken(): string | null {
    // 从 localStorage 获取存储的 token
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.token || null
      }
    } catch (error) {
      console.error('Error reading auth token:', error)
    }
    return null
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    const token = await this.getAuthToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    })

    if (!response.ok) {
      // 处理 401 未授权错误，跳转到登录页
      if (response.status === 401) {
        // 清除本地存储的认证信息
        try {
          localStorage.removeItem('auth-storage')
        } catch (error) {
          console.error('Error clearing auth storage:', error)
        }
        
        // 如果当前不在登录页，则跳转到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        const errorText = await response.text()
        throw new Error(`未授权：请重新登录 - ${errorText}`)
      }
      
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    // 处理空响应（如 DELETE 操作可能返回 204 No Content 或空响应体）
    const text = await response.text()
    
    // 如果响应体为空，返回空对象
    if (!text || text.trim() === '') {
      return {} as T
    }

    // 尝试解析 JSON 响应
    try {
      return JSON.parse(text)
    } catch (error) {
      // 如果解析失败，检查 content-type
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        // 如果是 JSON 类型但解析失败，抛出错误
        throw new Error(`Failed to parse JSON response: ${error}`)
      }
      // 如果不是 JSON 类型，返回空对象
      return {} as T
    }
  }

  // 认证相关
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  // 题目相关
  async getQuestions(params?: { page?: number; limit?: number; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    
    return this.request(`/questions?${searchParams}`)
  }

  async createQuestion(question: any) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    })
  }

  async updateQuestion(id: string, question: any) {
    return this.request(`/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(question),
    })
  }

  async deleteQuestion(id: string) {
    return this.request(`/questions/${id}`, {
      method: 'DELETE',
    })
  }

  // 试卷相关
  async getPapers() {
    return this.request('/papers')
  }

  async createPaper(paper: any) {
    return this.request('/papers', {
      method: 'POST',
      body: JSON.stringify(paper),
    })
  }

  async updatePaper(id: string, paper: any) {
    return this.request(`/papers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(paper),
    })
  }

  async deletePaper(id: string) {
    return this.request(`/papers/${id}`, {
      method: 'DELETE',
    })
  }

  async getPaper(id: string) {
    return this.request(`/papers/${id}`)
  }

  // AI 出题
  async generateQuestions(prompt: string, count: number, type: string) {
    return this.request('/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ prompt, count, type }),
    })
  }

  // 答卷相关
  async getAnswers(paperId: string) {
    return this.request(`/answers/${paperId}`)
  }

  // 报告相关
  async getReports() {
    return this.request('/reports')
  }

  async generateReport(paperId: string) {
    return this.request(`/reports/generate/${paperId}`, {
      method: 'POST',
    })
  }

  // 订阅相关
  async getSubscription() {
    return this.request('/subscriptions')
  }

  async createSubscription(plan: string) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })
  }
}

export const api = new ApiClient()
