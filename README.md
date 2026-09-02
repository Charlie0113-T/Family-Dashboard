<p align="center">
  <img src="public/logo.svg" width="96" height="96" alt="Family Dashboard Logo" />
</p>

<h1 align="center">Family Dashboard</h1>

<p align="center">注重隐私、完全离线的家庭管理看板 — 无需服务器，数据只留在你自己的浏览器里。</p>

<p align="center">
  <a href="README.en.md"><b>English</b></a> ·
  <span>简体中文</span>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-Apache%202.0-3B82F6.svg" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite&logoColor=white" />
  <img alt="Local First" src="https://img.shields.io/badge/storage-100%25%20local-9333EA.svg" />
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-F0468C.svg" />
</p>

---

**Family Dashboard** 是一个注重隐私的家庭管理看板应用，完全运行在本地浏览器中，无需服务器。它提供主密码保护和可扩展的模块化架构，帮助家庭成员集中管理日常事务。

## ✨ 功能特性

- 🔐 **主密码保护** — 统一密码锁定/解锁整个看板
- 📱 **免密设备** — 可选「此设备 7 天内免密」，刷新页面不再重复输密码，看板内可随时一键锁定
- 🧩 **模块化架构** — 自注册插件式模块，易于扩展
- 🔒 **客户端加密** — 敏感模块（日记、记账）的数据以 AES-GCM 密文落盘，密钥由 PBKDF2 从主密码派生
- 🕐 **本地时区日期** — 所有「今天」按本地时间判断，晚上记录不会因 UTC 偏移记到明天
- 💾 **本地优先存储** — 所有数据保存在浏览器 localStorage，完全离线可用
- ✨ **anime.js 动画** — 卡片入场、月份切换滑动、金额滚动等轻量动效，尊重系统「减弱动态效果」设置
- 🤖 **AI 接入预留** — 预留本地大模型（Ollama/llama.cpp）接口，敬请期待

## 📦 内置模块

| 模块 | 说明 | 数据加密 |
|------|------|----------|
| ✅ **待办事项 (Tasks)** | 家庭共享任务清单，支持添加、完成和删除 | 否 |
| 📔 **日记 (Diary)** | 按日期导航的每日日志，自动保存 | ✅ 是 |
| 😊 **心情 (Mood)** | 每日心情打卡（五级）及 7 天历史记录 | 否 |
| 💪 **健康 (Health)** | 饮水量、睡眠时长、步数追踪 | 否 |
| 💰 **记账 (Accounting)** | 按月收支记录，支持左右滑动切换月份；记账表单日期始终跟随当前查看的月份，不会出现「看的是 2 月、记到 9 月」 | ✅ 是 |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或其他包管理器

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

启动后在浏览器打开 `http://localhost:5173`，首次访问需设置主密码。

## 🏗️ 项目结构

```
src/
├── App.tsx                     # 根组件：路由配置 & 模块注册入口
├── main.tsx                    # React 应用入口
├── components/                 # 公共 UI 组件
│   ├── Layout.tsx              # 全局布局（主体 + 页脚）
│   ├── LockScreen.tsx          # 密码设置与解锁界面
│   └── ModuleCard.tsx          # 看板模块卡片
├── pages/                      # 路由页面
│   ├── Dashboard.tsx           # 主看板（模块网格）
│   └── ModulePage.tsx          # 单个模块动态渲染页
├── modules/                    # 功能模块
│   ├── todo/TodoModule.tsx     # 待办事项模块
│   ├── diary/DiaryModule.tsx   # 日记模块（加密）
│   ├── mood/MoodModule.tsx     # 心情模块
│   ├── health/HealthModule.tsx # 健康模块
│   └── accounting/AccountingModule.tsx # 记账模块（按月收支）
├── module-system/              # 模块系统
│   ├── ModuleRegistry.ts       # 中央模块注册表
│   └── ModuleTypes.ts          # 模块类型定义
├── core/                       # 核心服务层
│   ├── auth/AuthService.ts     # 主密码认证（SHA-256）
│   ├── data/DataService.ts     # localStorage 数据服务
│   ├── encryption/             # AES-GCM 加密服务
│   └── ai/AIService.ts         # AI 接口（预留）
├── store/
│   └── useAppStore.ts          # Zustand 全局状态
└── utils/
    └── helpers.ts              # 日期工具函数
```

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite | 8 | 构建工具 |
| React Router DOM | 7 | 客户端路由 |
| Zustand | 5 | 全局状态管理 |
| anime.js | 4 | 界面动画 |
| Web Crypto API | 浏览器内置 | AES-GCM 加密 |
| UUID | 13 | 唯一 ID 生成 |

## 🧩 添加自定义模块

1. 在 `src/modules/` 下新建模块目录，创建组件文件：

```tsx
// src/modules/mymodule/MyModule.tsx
import { ModuleRegistry } from '../../module-system/ModuleRegistry'

function MyModule() {
  return <div>我的模块内容</div>
}

ModuleRegistry.register({
  id: 'mymodule',
  name: '我的模块',
  icon: '⭐',
  description: '模块简介',
  encrypted: false,
  Component: MyModule,
})

export default MyModule
```

2. 在 `src/App.tsx` 中导入该模块：

```tsx
import './modules/mymodule/MyModule'
```

模块会自动出现在看板中。

## 🔑 安全说明

- **主密码**：使用 SHA-256 哈希存储，仅用于身份验证
- **数据加密**：标记为加密的模块（日记、记账）在写入 `localStorage` 前先经 AES-GCM 加密，磁盘上只有密文；密钥由 PBKDF2（100,000 次迭代）从主密码派生，仅存于内存。旧版本遗留的明文日记数据仍可读取，并会在下次打开/保存时自动重新加密
- **本地存储**：所有数据以 `fd_` 为前缀保存在 `localStorage`，不会上传至任何服务器
- **会话管理**：锁定后内存中的密钥会立即清除
- **免密设备**：勾选「此设备 7 天内免密」后，解锁密钥会保存在该设备的 `localStorage` 中，期间刷新页面无需再输密码。任何能使用这台设备浏览器的人在有效期内都能打开看板，请只在家中受信任的设备上勾选；点击看板右上角「Lock」会立即锁定并撤销该设备的免密状态

## 📄 开源协议

本项目基于 Apache License 2.0 开源。
