const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl = apiUrl

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `请求失败: ${response.status} ${response.statusText}`
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorMessage
      } catch {
        if (errorText) {
          errorMessage = errorText
        }
      }
      
      throw new Error(errorMessage)
    }

    const text = await response.text()
    
    if (!text || text.trim() === '') {
      return {} as T
    }

    try {
      return JSON.parse(text)
    } catch (error) {
      throw new Error(`解析响应失败: ${error}`)
    }
  }

  // 通过考试码获取试卷（公开端点）
  async getPaperByCode(code: string) {
    return this.request(`/papers/public/${code}`)
  }

  // 提交答卷（公开端点）
  async submitAnswer(answerData: any) {
    return this.request('/answers/public', {
      method: 'POST',
      body: JSON.stringify(answerData),
    })
  }
}

export const api = new ApiClient()

