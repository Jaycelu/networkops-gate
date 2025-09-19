# 网络工程师一站式集成服务 - 项目结构

## 1. 项目根目录

```
network-ops/
├── README.md              # 项目说明文档
├── PRD.md                 # 产品需求文档
├── ARCHITECTURE.md        # 系统架构设计文档
├── DATABASE_DESIGN.md     # 数据库设计文档
├── PROJECT_STRUCTURE.md   # 项目结构文档
├── TIMELINE_MILESTONES.md # 开发时间表和里程碑
├── WEB_DEVELOPMENT_PLAN.md # Web官网开发计划
├── DESKTOP_DEVELOPMENT_PLAN.md # 桌面应用开发计划
├── website.html           # 官网页面（原始文件）
├── 原型图.html             # 原型图文件
├── web-server/            # Web服务器目录
└── desktop-app/           # 桌面应用目录
```

## 2. Web官网目录结构

```
web-server/
├── index.html             # 首页
├── database/              # 数据库相关
│   ├── schema.sql         # 数据库结构
│   └── db_manager.py      # 数据库访问接口
├── backend/               # 后端服务
│   └── api.py             # Flask API服务
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── main.js            # 主要交互逻辑
│   ├── auth.js            # 认证相关功能
│   └── billing.js         # 账单管理功能
├── assets/
│   ├── images/            # 图片资源
│   └── icons/             # 图标资源
└── downloads/             # 应用下载文件
```

## 3. 桌面应用目录结构

```
desktop-app/
├── main.js                # Electron主进程
├── preload.js             # 预加载脚本
├── index.html             # 主界面HTML
├── renderer/              # 渲染进程
│   ├── js/                # 前端JavaScript
│   ├── css/               # 样式文件
│   └── assets/            # 静态资源
├── backend/               # 后端服务
│   ├── api/               # Flask API服务
│   │   ├── __init__.py
│   │   ├── app.py         # Flask应用入口
│   │   ├── routes/        # 路由定义
│   │   └── utils/         # 工具函数
│   ├── ai/                # AI模块
│   │   ├── __init__.py
│   │   ├── client.py      # AI客户端
│   │   └── models/        # 模型相关
│   ├── validator/         # 规则校验模块
│   │   ├── __init__.py
│   │   ├── network.py     # 网络设计校验
│   │   ├── config.py      # 配置校验
│   │   └── rules/         # 规则定义
│   └── automation/        # 自动化脚本引擎
│       ├── __init__.py
│       ├── ssh.py         # SSH连接模块
│       └── executor.py    # 执行器
├── database/              # 数据库相关
│   ├── __init__.py
│   ├── models.py          # 数据模型
│   ├── schema.sql         # 数据库结构
│   └── connection.py      # 数据库连接
├── config/                # 配置文件
│   ├── __init__.py
│   ├── settings.py        # 应用配置
│   └── default.json       # 默认配置
└── tests/                 # 测试目录
    ├── __init__.py
    ├── test_backend/      # 后端测试
    ├── test_renderer/     # 前端测试
    └── test_e2e/          # 端到端测试
```

## 4. 开发环境配置

### 4.1 Web官网开发环境
- Node.js (推荐v16+)
- Python (推荐3.8+)
- Nginx (推荐1.18+)
- 现代浏览器 (Chrome, Firefox, Safari, Edge)
- SQLite (推荐3.31+)

### 4.2 桌面应用开发环境
- Node.js (推荐v16+)
- Python (推荐3.10+)
- Electron (推荐v25+)
- Flask (推荐2.3+)
- 数据库: SQLite (开发环境)

## 5. 构建和部署

### 5.1 Web官网构建
- 静态文件打包
- CDN部署
- HTTPS配置

### 5.2 桌面应用构建
- Electron Builder打包
- 各平台安装包生成
- 自动更新配置