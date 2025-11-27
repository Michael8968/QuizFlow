import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PapersService } from './papers.service';
import { PaperRepository } from './paper.repository';
import { QuestionRepository } from '../questions/question.repository';
import { createMockPaper, createMockPapers, createMockQuestions } from '../test/mock-factory';
import {
  createMockPaperRepository,
  createMockQuestionRepository,
  MockPaperRepository,
  MockQuestionRepository,
} from '../test/mock-repositories';

describe('PapersService', () => {
  let service: PapersService;
  let paperRepository: MockPaperRepository;
  let questionRepository: MockQuestionRepository;

  const userId = 'user-123';
  const otherUserId = 'user-456';

  beforeEach(async () => {
    paperRepository = createMockPaperRepository();
    questionRepository = createMockQuestionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PapersService,
        { provide: PaperRepository, useValue: paperRepository },
        { provide: QuestionRepository, useValue: questionRepository },
      ],
    }).compile();

    service = module.get<PapersService>(PapersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('应该返回分页的试卷列表', async () => {
      const mockPapers = createMockPapers(5, { user_id: userId });
      paperRepository.findByUserId.mockResolvedValue({
        data: mockPapers,
        total: 10,
      });

      const result = await service.findAll(userId, { page: 1, limit: 5 });

      expect(result.data).toHaveLength(5);
      expect(result.meta).toEqual({
        page: 1,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });

    it('应该使用默认分页参数', async () => {
      paperRepository.findByUserId.mockResolvedValue({ data: [], total: 0 });

      const result = await service.findAll(userId);

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('findOne', () => {
    it('应该返回用户自己的试卷', async () => {
      const mockPaper = createMockPaper({ user_id: userId });
      paperRepository.findById.mockResolvedValue(mockPaper);

      const result = await service.findOne('paper-123', userId);

      expect(result).toEqual(mockPaper);
    });

    it('试卷不存在时应该抛出 NotFoundException', async () => {
      paperRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('访问他人试卷时应该抛出 ForbiddenException', async () => {
      const mockPaper = createMockPaper({ user_id: otherUserId });
      paperRepository.findById.mockResolvedValue(mockPaper);

      await expect(service.findOne('paper-123', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('应该成功创建草稿试卷', async () => {
      const dto = {
        title: '新试卷',
        description: '描述',
        question_ids: ['q1', 'q2'],
        settings: {
          time_limit: 60,
          shuffle_questions: false,
          shuffle_options: false,
          show_correct_answer: true,
          allow_review: true,
        },
      };
      const mockQuestions = createMockQuestions(2, { user_id: userId });
      const createdPaper = createMockPaper({ ...dto, user_id: userId, status: 'draft' });

      questionRepository.findByIds.mockResolvedValue(mockQuestions);
      paperRepository.create.mockResolvedValue(createdPaper);

      const result = await service.create(userId, dto);

      expect(result).toEqual(createdPaper);
      expect(questionRepository.findByIds).toHaveBeenCalledWith(['q1', 'q2']);
    });

    it('创建已发布试卷时应该生成考试码', async () => {
      const dto = {
        title: '新试卷',
        question_ids: [],
        status: 'published' as const,
        settings: {
          time_limit: 60,
          shuffle_questions: false,
          shuffle_options: false,
          show_correct_answer: true,
          allow_review: true,
        },
      };
      const createdPaper = createMockPaper({
        ...dto,
        user_id: userId,
        quiz_code: 'ABC123',
      });

      paperRepository.generateUniqueQuizCode.mockResolvedValue('ABC123');
      paperRepository.create.mockResolvedValue(createdPaper);

      const result = await service.create(userId, dto);

      expect(result.quiz_code).toBe('ABC123');
      expect(paperRepository.generateUniqueQuizCode).toHaveBeenCalled();
    });

    it('题目不存在时应该抛出 BadRequestException', async () => {
      const dto = {
        title: '新试卷',
        question_ids: ['q1', 'q2', 'q3'],
        settings: {
          time_limit: 60,
          shuffle_questions: false,
          shuffle_options: false,
          show_correct_answer: true,
          allow_review: true,
        },
      };
      // 只返回2个题目，但请求了3个
      questionRepository.findByIds.mockResolvedValue(
        createMockQuestions(2, { user_id: userId }),
      );

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('包含他人题目时应该抛出 ForbiddenException', async () => {
      const dto = {
        title: '新试卷',
        question_ids: ['q1', 'q2'],
        settings: {
          time_limit: 60,
          shuffle_questions: false,
          shuffle_options: false,
          show_correct_answer: true,
          allow_review: true,
        },
      };
      const mixedQuestions = [
        ...createMockQuestions(1, { user_id: userId }),
        ...createMockQuestions(1, { user_id: otherUserId }),
      ];
      questionRepository.findByIds.mockResolvedValue(mixedQuestions);

      await expect(service.create(userId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('应该成功更新试卷', async () => {
      const existingPaper = createMockPaper({ user_id: userId });
      const updatedPaper = { ...existingPaper, title: '更新后的标题' };

      paperRepository.findById.mockResolvedValue(existingPaper);
      paperRepository.update.mockResolvedValue(updatedPaper);

      const result = await service.update('paper-123', userId, {
        title: '更新后的标题',
      });

      expect(result.title).toBe('更新后的标题');
    });

    it('发布试卷时应该生成考试码', async () => {
      const existingPaper = createMockPaper({
        user_id: userId,
        status: 'draft',
        quiz_code: undefined,
      });
      const updatedPaper = { ...existingPaper, status: 'published' as const, quiz_code: 'XYZ789' };

      paperRepository.findById.mockResolvedValue(existingPaper);
      paperRepository.generateUniqueQuizCode.mockResolvedValue('XYZ789');
      paperRepository.update.mockResolvedValue(updatedPaper);

      const result = await service.update('paper-123', userId, {
        status: 'published',
      });

      expect(paperRepository.generateUniqueQuizCode).toHaveBeenCalled();
    });

    it('更新不存在的试卷时应该抛出 NotFoundException', async () => {
      paperRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', userId, { title: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('应该成功删除试卷', async () => {
      const mockPaper = createMockPaper({ user_id: userId });
      paperRepository.findById.mockResolvedValue(mockPaper);
      paperRepository.delete.mockResolvedValue(undefined);

      await service.remove('paper-123', userId);

      expect(paperRepository.delete).toHaveBeenCalledWith('paper-123');
    });

    it('删除他人试卷时应该抛出 ForbiddenException', async () => {
      const otherPaper = createMockPaper({ user_id: otherUserId });
      paperRepository.findById.mockResolvedValue(otherPaper);

      await expect(service.remove('paper-123', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findByCode', () => {
    it('应该通过考试码找到试卷', async () => {
      const mockPaper = createMockPaper({
        status: 'published',
        quiz_code: 'ABC123',
      });
      paperRepository.findByQuizCode.mockResolvedValue(mockPaper);

      const result = await service.findByCode('ABC123');

      expect(result).toEqual(mockPaper);
      expect(paperRepository.findByQuizCode).toHaveBeenCalledWith('ABC123');
    });

    it('考试码无效时应该抛出 NotFoundException', async () => {
      paperRepository.findByQuizCode.mockResolvedValue(null);

      await expect(service.findByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('publish', () => {
    it('应该成功发布试卷', async () => {
      const mockPaper = createMockPaper({ user_id: userId, status: 'draft' });
      const publishedPaper = { ...mockPaper, status: 'published' as const };

      paperRepository.findById.mockResolvedValue(mockPaper);
      paperRepository.updateStatus.mockResolvedValue(publishedPaper);

      const result = await service.publish('paper-123', userId);

      expect(result.status).toBe('published');
      expect(paperRepository.updateStatus).toHaveBeenCalledWith(
        'paper-123',
        'published',
      );
    });
  });

  describe('archive', () => {
    it('应该成功归档试卷', async () => {
      const mockPaper = createMockPaper({ user_id: userId, status: 'published' });
      const archivedPaper = { ...mockPaper, status: 'archived' as const };

      paperRepository.findById.mockResolvedValue(mockPaper);
      paperRepository.updateStatus.mockResolvedValue(archivedPaper);

      const result = await service.archive('paper-123', userId);

      expect(result.status).toBe('archived');
      expect(paperRepository.updateStatus).toHaveBeenCalledWith(
        'paper-123',
        'archived',
      );
    });
  });

  describe('count', () => {
    it('应该返回用户的试卷数量', async () => {
      paperRepository.countByUserId.mockResolvedValue(15);

      const result = await service.count(userId);

      expect(result).toBe(15);
    });
  });
});
