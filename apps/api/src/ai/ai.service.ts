import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generateQuestions(prompt: string, count: number, type: string) {
    const systemPrompt = `你是一个专业的出题助手。请根据用户提供的内容生成${count}道${type}题目。

要求：
1. 题目内容要准确、清晰
2. 选项要合理且具有迷惑性
3. 难度适中
4. 提供正确答案和解析
5. 返回 JSON 格式

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
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        // model: 'gpt-3.5-turbo',
        model: "deepseek-chat",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 生成失败');
      }

      return JSON.parse(content);
    } catch (error) {
      throw new Error(`AI 生成题目失败: ${error.message}`);
    }
  }
}
