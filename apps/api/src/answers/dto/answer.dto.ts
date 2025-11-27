import {
  IsString,
  IsOptional,
  IsEmail,
  IsObject,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AnswerStatus } from '@quizflow/types';

/**
 * 提交答卷 DTO
 */
export class SubmitAnswerDto {
  @ApiProperty({ description: '试卷考试码', example: 'ABC123' })
  @IsString()
  quiz_code: string;

  @ApiPropertyOptional({ description: '学生姓名' })
  @IsOptional()
  @IsString()
  student_name?: string;

  @ApiPropertyOptional({ description: '学生邮箱' })
  @IsOptional()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  student_email?: string;

  @ApiProperty({
    description: '答题响应',
    example: { q1: 'A', q2: ['B', 'C'] },
  })
  @IsObject()
  responses: Record<string, string | string[]>;

  @ApiProperty({ description: '答题耗时（秒）', example: 1800 })
  @IsNumber()
  @Min(0)
  time_spent: number;
}

/**
 * 更新答卷分数 DTO
 */
export class UpdateScoreDto {
  @ApiProperty({ description: '得分', minimum: 0 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ description: '总分', minimum: 0 })
  @IsNumber()
  @Min(0)
  total_score: number;
}

/**
 * 查询答卷列表参数
 */
export class QueryAnswersDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: '学生邮箱' })
  @IsOptional()
  @IsEmail()
  student_email?: string;

  @ApiPropertyOptional({
    description: '答卷状态',
    enum: ['in_progress', 'completed', 'graded'],
  })
  @IsOptional()
  @IsEnum(['in_progress', 'completed', 'graded'])
  status?: AnswerStatus;
}
