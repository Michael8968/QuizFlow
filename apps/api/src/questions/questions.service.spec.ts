import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionRepository } from './question.repository';
import { createMockQuestion, createMockQuestions } from '../test/mock-factory';
import { createMockQuestionRepository, MockQuestionRepository } from '../test/mock-repositories';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let repository: MockQuestionRepository;

  const userId = 'user-123';
  const otherUserId = 'user-456';

  beforeEach(async () => {
    repository = createMockQuestionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: QuestionRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('应该返回分页的题目列表', async () => {
      const mockQuestions = createMockQuestions(5, { user_id: userId });
      repository.findByUserId.mockResolvedValue({
        data: mockQuestions,
        total: 15,
      });

      const result = await service.findAll(userId, { page: 1, limit: 5 });

      expect(result.data).toHaveLength(5);
      expect(result.meta).toEqual({
        page: 1,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
      expect(repository.findByUserId).toHaveBeenCalledWith({
        userId,
        page: 1,
        limit: 5,
      });
    });

    it('应该使用默认分页参数', async () => {
      repository.findByUserId.mockResolvedValue({ data: [], total: 0 });

      const result = await service.findAll(userId);

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('findOne', () => {
    it('应该返回用户自己的题目', async () => {
      const mockQuestion = createMockQuestion({ user_id: userId });
      repository.findById.mockResolvedValue(mockQuestion);

      const result = await service.findOne('question-123', userId);

      expect(result).toEqual(mockQuestion);
      expect(repository.findById).toHaveBeenCalledWith('question-123');
    });

    it('题目不存在时应该抛出 NotFoundException', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('访问他人题目时应该抛出 ForbiddenException', async () => {
      const mockQuestion = createMockQuestion({ user_id: otherUserId });
      repository.findById.mockResolvedValue(mockQuestion);

      await expect(service.findOne('question-123', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('应该成功创建单选题', async () => {
      const dto = {
        type: 'single' as const,
        content: '1+1=?',
        options: ['1', '2', '3', '4'],
        answer: '2',
        tags: ['math'],
        difficulty: 'easy' as const,
        points: 10,
      };
      const createdQuestion = createMockQuestion({ ...dto, user_id: userId });
      repository.create.mockResolvedValue(createdQuestion);

      const result = await service.create(userId, dto);

      expect(result).toEqual(createdQuestion);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        user_id: userId,
      });
    });

    it('应该成功创建填空题（无需选项）', async () => {
      const dto = {
        type: 'fill' as const,
        content: '中国的首都是____',
        answer: '北京',
        tags: ['geography'],
        difficulty: 'easy' as const,
        points: 5,
      };
      const createdQuestion = createMockQuestion({ ...dto, user_id: userId });
      repository.create.mockResolvedValue(createdQuestion);

      const result = await service.create(userId, dto);

      expect(result).toEqual(createdQuestion);
    });

    it('选择题没有选项时应该抛出 BadRequestException', async () => {
      const dto = {
        type: 'single' as const,
        content: '1+1=?',
        options: [] as string[],
        answer: '2',
        tags: [] as string[],
        difficulty: 'easy' as const,
        points: 1,
      };

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('选择题选项少于2个时应该抛出 BadRequestException', async () => {
      const dto = {
        type: 'multiple' as const,
        content: '选择正确答案',
        options: ['A'],
        answer: 'A',
        tags: [] as string[],
        difficulty: 'easy' as const,
        points: 1,
      };

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('应该成功更新题目', async () => {
      const existingQuestion = createMockQuestion({ user_id: userId });
      const updatedQuestion = { ...existingQuestion, content: '更新后的内容' };

      repository.findById.mockResolvedValue(existingQuestion);
      repository.update.mockResolvedValue(updatedQuestion);

      const result = await service.update('question-123', userId, {
        content: '更新后的内容',
      });

      expect(result.content).toBe('更新后的内容');
      expect(repository.update).toHaveBeenCalledWith('question-123', {
        content: '更新后的内容',
      });
    });

    it('更新不存在的题目时应该抛出 NotFoundException', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', userId, { content: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('更新他人题目时应该抛出 ForbiddenException', async () => {
      const otherQuestion = createMockQuestion({ user_id: otherUserId });
      repository.findById.mockResolvedValue(otherQuestion);

      await expect(
        service.update('question-123', userId, { content: 'new' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('应该成功删除题目', async () => {
      const mockQuestion = createMockQuestion({ user_id: userId });
      repository.findById.mockResolvedValue(mockQuestion);
      repository.delete.mockResolvedValue(undefined);

      await service.remove('question-123', userId);

      expect(repository.delete).toHaveBeenCalledWith('question-123');
    });

    it('删除不存在的题目时应该抛出 NotFoundException', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('删除他人题目时应该抛出 ForbiddenException', async () => {
      const otherQuestion = createMockQuestion({ user_id: otherUserId });
      repository.findById.mockResolvedValue(otherQuestion);

      await expect(service.remove('question-123', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findByIds', () => {
    it('应该返回用户的多个题目', async () => {
      const mockQuestions = createMockQuestions(3, { user_id: userId });
      repository.findByIds.mockResolvedValue(mockQuestions);

      const result = await service.findByIds(
        ['q1', 'q2', 'q3'],
        userId,
      );

      expect(result).toHaveLength(3);
    });

    it('包含他人题目时应该抛出 ForbiddenException', async () => {
      const mixedQuestions = [
        createMockQuestion({ id: 'q1', user_id: userId }),
        createMockQuestion({ id: 'q2', user_id: otherUserId }),
      ];
      repository.findByIds.mockResolvedValue(mixedQuestions);

      await expect(
        service.findByIds(['q1', 'q2'], userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getTags', () => {
    it('应该返回用户的所有标签', async () => {
      const mockTags = ['math', 'physics', 'chemistry'];
      repository.getTagsByUserId.mockResolvedValue(mockTags);

      const result = await service.getTags(userId);

      expect(result).toEqual(mockTags);
      expect(repository.getTagsByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('count', () => {
    it('应该返回用户的题目数量', async () => {
      repository.countByUserId.mockResolvedValue(42);

      const result = await service.count(userId);

      expect(result).toBe(42);
      expect(repository.countByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
