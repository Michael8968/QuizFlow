import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters';
import { TransformInterceptor, LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS 配置
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', '')
    .split(',')
    .filter((origin) => origin.trim())
    .concat([
      'http://localhost:3000', // Web 前端（开发环境）
      'http://localhost:3002', // H5 答卷（开发环境）
    ]);

  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（如移动应用、Postman 等）
      if (!origin) {
        return callback(null, true);
      }
      // 检查 origin 是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API 前缀
  app.setGlobalPrefix('api');

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('QuizFlow API')
    .setDescription('AI 题库 + 答卷 SaaS 平台 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  
  console.log(`🚀 API 服务运行在: http://localhost:${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/api/docs`);
}

bootstrap();
