# QuizFlow - AI 题库 + 答卷 SaaS 平台

> 让教育机构和教师在 5 分钟内生成题库、组卷、在线答卷和自动分析报告

## 🚀 项目概述

QuizFlow 是一个基于 AI 的智能题库和在线答卷平台，为教育机构和教师提供：

- 🧠 AI 自动出题，节省 80% 出卷时间
- 📱 H5 答卷自动适配手机/平板
- 📊 自动统计与分析，生成成绩报告
- ⚡ SaaS 模式，教师 & 学生即开即用

## 🏗️ 技术架构

### 前端
- **框架**: React + Vite + TypeScript
- **UI 组件**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **H5 答卷**: 独立 React 子项目

### 后端
- **框架**: NestJS
- **数据库**: PostgreSQL (Supabase)
- **AI 功能**: OpenAI API
- **认证**: Supabase Auth
- **文件存储**: Supabase Storage

### 部署
- **前端**: Vercel
- **后端**: Render / Supabase Edge Functions
- **CDN**: Cloudflare

## 📁 项目结构

```
QuizFlow/
├── apps/
│   ├── web/                 # 教师端 Web 应用
│   ├── h5-quiz/            # H5 答卷子项目
│   └── api/                # NestJS 后端 API
├── packages/
│   ├── shared/             # 共享类型和工具
│   └── ui/                 # 共享 UI 组件
├── database/               # 数据库结构和配置
├── docs/                   # 项目文档
└── scripts/               # 构建和部署脚本
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Yarn
- PostgreSQL (或使用 Supabase)

### 安装依赖
```bash
# 标准安装（如果遇到 puppeteer 网络超时，会自动跳过脚本）
yarn install

# 如果上述命令失败，使用以下命令跳过所有 postinstall 脚本
yarn install --ignore-scripts
```

> **注意**: 由于 puppeteer 安装时需要从 Google 服务器下载 Chromium，可能遇到网络超时问题。项目已配置跳过 Chromium 自动下载。
> 
> 如需使用 PDF 导出功能，可以：
> - 使用系统已安装的 Chrome/Chromium，通过 `PUPPETEER_EXECUTABLE_PATH` 环境变量指定路径
> - 手动下载 Chromium 并配置路径
> - 配置代理或使用国内镜像下载 Chromium

### 启动开发环境
```bash
# 启动所有服务
yarn dev

# 或分别启动
yarn dev:web      # 教师端
yarn dev:h5       # H5 答卷
yarn dev:api      # 后端 API
```

## 📋 功能模块

- [x] 项目初始化
- [x] 用户认证系统
- [x] 题库管理
- [x] 智能组卷
- [x] H5 答卷系统
- [x] 成绩分析
- [x] AI 出题
- [x] 支付订阅

## 💰 订阅套餐

| 套餐 | 月费 | 功能 |
|------|------|------|
| 🆓 免费版 | ¥0 | 100题，1套试卷 |
| 💼 专业版 | ¥49 | 无限题库 + 智能组卷 |
| 🏫 机构版 | ¥199 | 多教师协作 + 班级管理 |
| 🧠 AI 增强版 | ¥299 | AI 出题 + AI 解析 |

## 📄 许可证

MIT License