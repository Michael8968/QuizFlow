import { IsString, IsArray, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { QuestionType, DifficultyLevel } from '@quizflow/types';

export class CreateQuestionDto {
  @ApiProperty({ description: '题目类型', enum: ['single', 'multiple', 'fill', 'essay'] })
  @IsEnum(['single', 'multiple', 'fill', 'essay'])
  type: QuestionType;

  @ApiProperty({ description: '题目内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '选项（选择题）', required: false })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({ description: '正确答案' })
  @IsString()
  answer: string;

  @ApiProperty({ description: '答案解析', required: false })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ description: '标签' })
  @IsArray()
  tags: string[];

  @ApiProperty({ description: '难度', enum: ['easy', 'medium', 'hard'] })
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: DifficultyLevel;

  @ApiProperty({ description: '分值', minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  points: number;
}

export class UpdateQuestionDto {
  @ApiProperty({ description: '题目类型', required: false })
  @IsOptional()
  @IsEnum(['single', 'multiple', 'fill', 'essay'])
  type?: QuestionType;

  @ApiProperty({ description: '题目内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '选项（选择题）', required: false })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({ description: '正确答案', required: false })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiProperty({ description: '答案解析', required: false })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: '难度', required: false })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: DifficultyLevel;

  @ApiProperty({ description: '分值', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  points?: number;
}
