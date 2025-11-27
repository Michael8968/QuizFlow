/**
 * 分数分布数据
 */
export interface ScoreDistribution {
  score: number;
  count: number;
}

/**
 * 题目分析数据
 */
export interface QuestionAnalysis {
  question_id: string;
  correct_rate: number;
}

/**
 * 时间分析数据
 */
export interface TimeAnalysis {
  time_range: string;
  count: number;
}

/**
 * 报告摘要
 */
export interface ReportSummary {
  total_students: number;
  average_score: number;
  pass_rate: number;
  completion_rate: number;
}

/**
 * 报告图表数据
 */
export interface ReportChartData {
  score_distribution: ScoreDistribution[];
  question_analysis: QuestionAnalysis[];
  time_analysis: TimeAnalysis[];
}

/**
 * 完整报告信息
 */
export interface Report {
  id: string;
  paper_id: string;
  user_id: string;
  summary: ReportSummary;
  chart_data: ReportChartData;
  pdf_url?: string;
  created_at: string;
}

/**
 * 带试卷标题的报告（列表展示用）
 */
export interface ReportWithPaper extends Report {
  paper?: {
    title: string;
  };
}

/**
 * 生成报告请求
 */
export interface GenerateReportDto {
  paper_id: string;
}
