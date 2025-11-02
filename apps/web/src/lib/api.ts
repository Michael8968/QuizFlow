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

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
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
      method: 'PUT',
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
      method: 'PUT',
      body: JSON.stringify(paper),
    })
  }

  async deletePaper(id: string) {
    return this.request(`/papers/${id}`, {
      method: 'DELETE',
    })
  }

  // AI 出题
  async generateQuestions(prompt: string, count: number, type: string) {
    return this.request('/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ prompt, count, type }),
    })
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
}

export const api = new ApiClient()
