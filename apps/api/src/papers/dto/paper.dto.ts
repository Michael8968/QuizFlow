import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PaperStatus, PaperSettings } from '@quizflow/types';

/**
 * 试卷设置 DTO
 */
export class PaperSettingsDto implements PaperSettings {
  @ApiPropertyOptional({ description: '答题时间限制（分钟）' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  time_limit?: number;

  @ApiProperty({ description: '是否打乱题目顺序', default: false })
  @IsBoolean()
  shuffle_questions: boolean = false;

  @ApiProperty({ description: '是否打乱选项顺序', default: false })
  @IsBoolean()
  shuffle_options: boolean = false;

  @ApiProperty({ description: '提交后是否显示正确答案', default: true })
  @IsBoolean()
  show_correct_answer: boolean = true;

  @ApiProperty({ description: '是否允许回顾答题', default: true })
  @IsBoolean()
  allow_review: boolean = true;
}

/**
 * 创建试卷 DTO
 */
export class CreatePaperDto {
  @ApiProperty({ description: '试卷标题', example: '期中考试' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '试卷描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '题目 ID 列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  question_ids: string[];

  @ApiProperty({ description: '试卷设置', type: PaperSettingsDto })
  @ValidateNested()
  @Type(() => PaperSettingsDto)
  @IsObject()
  settings: PaperSettingsDto;

  @ApiPropertyOptional({
    description: '试卷状态',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: PaperStatus;
}

/**
 * 更新试卷 DTO
 */
export class UpdatePaperDto {
  @ApiPropertyOptional({ description: '试卷标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '试卷描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '题目 ID 列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  question_ids?: string[];

  @ApiPropertyOptional({ description: '试卷设置', type: PaperSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaperSettingsDto)
  @IsObject()
  settings?: PaperSettingsDto;

  @ApiPropertyOptional({
    description: '试卷状态',
    enum: ['draft', 'published', 'archived'],
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: PaperStatus;
}

/**
 * 查询试卷列表参数
 */
export class QueryPapersDto {
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

  @ApiPropertyOptional({
    description: '试卷状态',
    enum: ['draft', 'published', 'archived'],
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: PaperStatus;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;
}
