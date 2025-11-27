import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY 未配置，AI 功能将无法使用');
    }
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    });
  }

  /**
   * 从可能包含 markdown 代码块的内容中提取 JSON
   */
  private extractJsonFromContent(content: string): any {
    // 尝试直接解析
    try {
      return JSON.parse(content);
    } catch (e) {
      // 如果失败，尝试提取 markdown 代码块中的 JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (e2) {
          this.logger.error('从 markdown 代码块中解析 JSON 失败', e2);
        }
      }
      
      // 尝试查找 JSON 对象
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          return JSON.parse(jsonObjectMatch[0]);
        } catch (e3) {
          this.logger.error('从内容中提取 JSON 对象失败', e3);
        }
      }
      
      throw new Error('无法从 AI 响应中解析 JSON 数据');
    }
  }

  async generateQuestions(prompt: string, count: number, type: string, userId?: string) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 未配置，请联系管理员');
    }

    const systemPrompt = `你是一个专业的出题助手。请根据用户提供的内容生成${count}道${type}题目。

要求：
1. 题目内容要准确、清晰
2. 选项要合理且具有迷惑性
3. 难度适中
4. 提供正确答案和解析
5. 必须返回有效的 JSON 格式，不要包含任何 markdown 代码块标记

格式示例：
{
  "questions": [
    {
      "type": "single",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "A",
      "explanation": "解析内容",
      "difficulty": "medium",
      "points": 5,
      "tags": ["标签1", "标签2"]
    }
  ]
}

重要：直接返回 JSON 对象，不要使用 \`\`\`json 代码块包裹。`;

    try {
      this.logger.log(`开始生成题目: count=${count}, type=${type}, userId=${userId}`);
      
      const completion = await this.openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        this.logger.error('AI 返回内容为空');
        throw new Error('AI 生成失败：返回内容为空');
      }

      this.logger.debug(`AI 返回内容: ${content.substring(0, 200)}...`);

      const result = this.extractJsonFromContent(content);
      
      // 验证结果格式
      if (!result.questions || !Array.isArray(result.questions)) {
        this.logger.error('AI 返回格式不正确', result);
        throw new Error('AI 返回格式不正确：缺少 questions 数组');
      }

      this.logger.log(`成功生成 ${result.questions.length} 道题目`);
      return result;
    } catch (error) {
      this.logger.error('AI 生成题目失败', error.stack);
      
      // 提供更友好的错误消息
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401) {
          throw new Error('API Key 无效，请联系管理员');
        } else if (error.status === 429) {
          throw new Error('API 请求频率过高，请稍后再试');
        } else if (error.status === 500 || error.status === 503) {
          throw new Error('AI 服务暂时不可用，请稍后再试');
        }
        throw new Error(`AI 服务错误: ${error.message}`);
      }
      
      throw new Error(`AI 生成题目失败: ${error.message}`);
    }
  }
}
