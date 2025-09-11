# iFlow CLI 上下文说明 (IFLOW.md)

## 项目概述

本项目是一个网络工程师一站式集成服务，包含两个主要组成部分：

1. **Web官网**：基于HTML/CSS/JavaScript构建的营销官网，提供产品介绍、用户注册登录、账单管理、应用下载等功能。
2. **移动桌面端应用**：基于AI大模型驱动的专业工具，支持Windows、macOS、Linux平台，帮助用户快速完成网络架构设计、设备配置及管理。

## 项目结构

```
/home/ubuntu/network-ops/
├── ARCHITECTURE.md              # 系统架构设计文档
├── DATABASE_DESIGN.md           # 数据库设计文档
├── DESKTOP_DEVELOPMENT_PLAN.md  # 桌面端开发计划
├── PRD.md                       # 产品需求文档
├── PROJECT_STRUCTURE.md         # 项目结构说明
├── TIMELINE_MILESTONES.md       # 时间线和里程碑
├── WEB_DEVELOPMENT_PLAN.md      # Web端开发计划
├── web-server.conf              # Web服务器配置文件
├── website.html                 # Web官网首页
├── 原型图.html                  # 产品原型图
└── web-server/                  # Web服务相关文件
    ├── index.html               # Web服务器首页
    ├── backend/                 # 后端服务
    │   └── api.py               # Flask API服务
    └── database/                # 数据库相关
        ├── db_manager.py        # 数据库访问接口
        ├── network_ops.db       # SQLite数据库文件
        ├── schema.sql           # 数据库结构定义
        └── __pycache__/         # Python缓存文件
```

## 技术栈

### Web官网
- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **UI框架**：Tailwind CSS + Iconify图标库
- **交互功能**：原生JavaScript实现注册登录、账单管理等
- **部署**：阿里云ECS + CDN静态资源加速

### 移动桌面端应用
- **前端**：Electron框架开发，支持Windows、macOS、Linux
- **后端**：Flask框架处理用户请求，AI模块集成大模型API代理（如aihubmix）
- **规则校验模块**：独立服务，基于Python开发，校验AI输出
- **自动化脚本引擎**：基于Python Paramiko，用于设备交互（如SSH配置推送）
- **数据存储**：本地SQLite数据库存储用户信息、设计方案、配置历史
- **设备交互**：支持SSH/串口通信
- **部署**：通过Electron打包为各平台安装包进行分发

## 核心功能模块

### Web官网功能
1. 产品介绍页面
2. 用户注册登录
3. 账单管理（Token余额查看、使用记录、充值功能）
4. 应用下载（支持Windows、macOS、Linux版本下载）
5. 联系我们

### 移动桌面端应用功能
1. 架构设计与IP规划（AI驱动）
2. 设备配置生成（AI驱动）
3. 规则校验模块（对AI生成的网络设计和配置脚本进行规则校验）
4. 批量配置与修改（通过SSH批量推送配置到设备）
5. 配置备份与导入导出
6. 基线文档生成（AI驱动）
7. 大模型选择（系统配置中支持用户选择大模型API代理）

## 数据库设计

使用SQLite数据库存储用户信息，主要包含以下表：

### users表
- `id`: 用户ID (INTEGER PRIMARY KEY AUTOINCREMENT)
- `username`: 用户名 (VARCHAR(50) NOT NULL UNIQUE)
- `email`: 邮箱 (VARCHAR(100) NOT NULL UNIQUE)
- `phone`: 手机号 (VARCHAR(20) NOT NULL UNIQUE)
- `password_hash`: 密码哈希值 (VARCHAR(255) NOT NULL)
- `token_balance`: Token余额 (INTEGER DEFAULT 1000)
- `created_at`: 创建时间 (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `updated_at`: 更新时间 (DATETIME DEFAULT CURRENT_TIMESTAMP)

## 开发与运行

### Web服务启动
后端API服务基于Flask框架，可通过以下命令启动：
```bash
cd /home/ubuntu/network-ops/web-server/backend
python api.py
```
服务默认运行在 `127.0.0.1:9528`。

### 数据库初始化
数据库会在首次访问时自动初始化，创建所需的表结构和索引。

## 商业模式
产品采用混合收费模式：
1. **AI功能收费**：基于token使用量计费，适用于架构设计、设备配置生成、配置检查等功能。
2. **非AI功能收费**：一次性买断付费，适用于批量配置与修改、配置备份等功能。