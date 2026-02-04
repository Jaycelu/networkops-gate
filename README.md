# 网络工程师一站式集成服务

## 🚀 项目概述

**网络工程师一站式集成服务**是一个专为网络工程师和企业IT团队设计的智能化网络管理解决方案。项目包含两个核心组成部分：

1. **Web官网**：基于HTML/CSS/JavaScript构建的营销管理平台，提供产品介绍、用户注册登录、账单管理、应用下载等功能
2. **移动桌面端应用**：基于AI大模型驱动的专业工具，支持Windows、macOS、Linux平台，帮助用户快速完成网络架构设计、设备配置及管理

通过AI驱动的自动化和多端集成服务，本产品旨在简化网络设计与管理流程，助力企业高效完成数字化转型。

## 🎯 核心功能

### Web官网功能
- ✅ **产品介绍页面**：展示核心功能、价值主张、技术特色
- ✅ **用户注册登录**：支持邮箱注册、密码登录、用户信息管理
- ✅ **账单管理**：Token余额查看、使用记录、充值功能
- ✅ **应用下载**：支持Windows、macOS、Linux版本下载
- ✅ **联系我们**：提供多种联系方式和反馈渠道

### 桌面应用功能
- 🧠 **架构设计与IP规划**（AI驱动）：根据用户输入生成网络架构和IP地址分配方案
- ⚙️ **设备配置生成**（AI驱动）：基于设计结果生成主流设备的配置命令
- 🔍 **规则校验模块**：对AI生成的网络设计和配置脚本进行规则校验，确保符合网络工程最佳实践
- 📡 **批量配置与修改**：通过SSH批量推送配置到设备
- 💾 **配置备份与导入导出**：支持设备配置的备份、导入和导出功能
- 📄 **基线文档生成**（AI驱动）：根据设计方案自动生成网络基线文档
- 🎯 **大模型选择**：系统配置中支持用户选择大模型API代理

## 🏗️ 系统架构

### 技术栈

#### Web官网
- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **UI框架**：Tailwind CSS + Iconify图标库
- **后端**：Flask框架（Python）
- **数据库**：SQLite
- **部署**：阿里云ECS + CDN静态资源加速

#### 桌面应用
- **跨平台框架**：Electron 25.x
- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **后端服务**：Flask框架（Python）
- **AI集成**：支持aihubmix等大模型API代理
- **设备交互**：Paramiko（SSH通信）
- **数据库**：SQLite（本地存储）
- **打包分发**：Electron Builder

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web官网层                                 │
├─────────────────────────────────────────────────────────────────┤
│  用户浏览器 → Nginx → 静态文件(HTML/CSS/JS) → Flask API服务     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      桌面应用层                                  │
├─────────────────────────────────────────────────────────────────┤
│  Electron前端 → IPC通信 → Flask后端服务 → 本地SQLite数据库     │
│                    ↓                                            │
│  AI模块(大模型API) → 规则校验模块 → 自动化脚本引擎(Paramiko)   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      网络设备层                                  │
├─────────────────────────────────────────────────────────────────┤
│  SSH/串口通信 → Cisco/Huawei/H3C等主流网络设备                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 项目结构

```
/home/ubuntu/all-in-one/
├── README.md                          # 项目说明文档
├── package.json                       # Node.js依赖配置
├── package-lock.json                  # Node.js依赖锁定文件
├── docs/                              # 项目文档目录
│   ├── ARCHITECTURE.md               # 系统架构设计文档
│   ├── BACKEND_INTEGRATION_GUIDE.md  # 后端集成指南
│   ├── DATABASE_DESIGN.md            # 数据库设计文档
│   ├── DESKTOP_DEVELOPMENT_PLAN.md   # 桌面端开发计划
│   ├── IFLOW.md                      # iFlow CLI上下文说明
│   ├── PRD.md                        # 产品需求文档
│   ├── PROJECT_STRUCTURE.md          # 项目结构说明
│   ├── README.md                     # 文档说明
│   ├── SSL_CERTIFICATE_UPDATE_GUIDE.md # SSL证书更新指南
│   ├── SSL_Installation_SOP.md       # SSL安装SOP
│   ├── TIMELINE_MILESTONES.md        # 时间线和里程碑
│   └── WEB_DEVELOPMENT_PLAN.md       # Web端开发计划
├── web/                               # Web官网目录
│   ├── index.html                    # 官网首页（含功能模块轮播）
│   ├── 公众号.jpg                     # 微信公众号二维码
│   ├── 公安图标.png                   # 公安备案图标
│   ├── backend/                      # 后端服务
│   │   ├── api.py                    # Flask API服务
│   │   ├── flask.log                 # Flask日志文件
│   │   ├── network-api.service       # 网络API服务配置
│   │   └── wsgi.py                   # WSGI入口
│   ├── database/                     # 数据库相关
│   │   ├── db_manager.py             # 数据库访问接口
│   │   ├── login_example.py          # 登录示例
│   │   ├── network_ops.db            # SQLite数据库文件
│   │   └── schema.sql                # 数据库结构定义
│   ├── downloads/                    # 应用下载文件目录
│   └── js/                           # JavaScript文件
│       └── performance-monitor.js    # 性能监控脚本
├── config/                            # 配置文件目录
│   └── web-server.conf               # Web服务器配置
├── scripts/                           # 测试脚本目录
│   ├── test-live-website.py          # 实时网站测试脚本
│   ├── test-website.js               # 网站测试脚本
│   └── validate-website.py           # 网站验证脚本
├── assets/                            # 静态资源目录
│   └── 公众号.jpg                     # 微信公众号二维码
└── .iflow/                            # iFlow CLI技能目录
    └── skills/
        └── ui-ux-pro-max/             # UI/UX设计技能
```

## 🚀 快速开始

### 环境要求

#### Web官网环境
- Node.js (推荐 v16+)
- Python (推荐 3.8+)
- Nginx (推荐 1.18+)
- SQLite (推荐 3.31+)

#### 桌面应用环境
- Node.js (推荐 v16+)
- Python (推荐 3.10+)
- Electron (推荐 v25+)
- Flask (推荐 2.3+)

### Web官网启动

1. **启动后端API服务**
```bash
cd /home/ubuntu/all-in-one/web-server/backend
python api.py
```
服务默认运行在 `http://127.0.0.1:9528`

2. **配置Web服务器**
```bash
# 使用提供的nginx配置文件
sudo cp /home/ubuntu/all-in-one/web-server.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/web-server.conf /etc/nginx/sites-enabled/
sudo nginx -s reload
```

3. **访问官网**
打开浏览器访问 `http://localhost` 即可查看官网

### 桌面应用开发

1. **安装依赖**
```bash
cd /home/ubuntu/all-in-one
electron-builder install-app-deps
```

2. **开发模式启动**
```bash
electron .
```

3. **构建安装包**
```bash
# Windows平台
electron-builder --win

# macOS平台
electron-builder --mac

# Linux平台
electron-builder --linux
```

## 💰 商业模式

产品采用混合收费模式，区分AI功能和非AI功能：

### AI功能（按Token使用量计费）
- **计费单位**：每1000 token收费$1
- **预充值**：用户需购买token包（$10起充，包含10000 token）
- **免费试用**：新用户赠送1000 token
- **适用功能**：
  - 架构设计与IP规划
  - 设备配置生成
  - 基线文档生成

### 非AI功能（一次性买断付费）
- **基础版**：$200，永久使用批量配置与修改、配置备份等功能
- **扩展包**：支持设备数量上限（如50台），超出需购买扩展包

### Web官网服务
- **基础功能**：免费
- **增值服务**：高级技术支持、企业服务等

## 🔧 核心模块详解

### 规则校验模块

规则校验模块是提高AI输出准确性的关键组件，确保网络架构设计、IP规划和设备配置符合网络工程最佳实践和厂商标准。

#### 支持的设备厂商
- ✅ Cisco
- ✅ Huawei
- ✅ H3C

#### 校验规则分类
1. **网络架构设计与IP规划规则**
   - IP地址合法性检查
   - 子网划分合理性验证
   - VLAN数量与ID范围检查
   - 设备数量与架构一致性验证

2. **设备配置脚本规则**
   - 命令语法正确性检查
   - 上下文依赖性验证
   - 安全合规性检查
   - 最佳实践一致性验证

#### 输出处理
- **自动修正**：对可明确修正的错误自动调整
- **用户提示**：对不可修正问题提供修改建议
- **校验报告**：生成详细的校验报告（JSON/HTML格式）

### AI集成设计

#### 大模型API支持
- **aihubmix**：主要推荐的API代理
- **自定义API**：支持用户配置其他大模型API代理
- **动态切换**：支持在应用中快速切换不同的API服务

#### Token使用监控
- **实时记录**：记录每次AI调用的token消耗
- **余额提醒**：token余额不足时自动提醒
- **使用统计**：提供详细的token使用历史和分析

## 🛡️ 安全设计

### 数据安全
- **密码加密**：用户密码使用bcrypt加密存储
- **凭据保护**：设备SSH凭据使用系统密钥库加密存储
- **API密钥**：大模型API密钥本地加密保存

### 操作安全
- **配置确认**：批量配置操作需要用户二次确认
- **权限控制**：基于用户角色的功能访问控制
- **审计日志**：记录关键操作和配置变更历史

### 网络安全
- **HTTPS传输**：所有网络通信使用HTTPS加密
- **SSH安全**：使用密钥认证，禁用不安全的Telnet
- **输入验证**：严格的用户输入验证和过滤

## 📊 性能指标

### Web官网性能
- **页面加载时间**：< 3秒
- **并发用户数**：1000+
- **可用性**：99.9%
- **响应时间**：API响应 < 200ms

### 桌面应用性能
- **启动时间**：< 5秒
- **AI生成响应**：< 30秒（中小型网络）
- **批量配置**：10台设备 < 5分钟
- **内存占用**：< 500MB

## 🧪 测试策略

### 功能测试
- **单元测试**：各模块独立功能测试
- **集成测试**：模块间协作测试
- **端到端测试**：完整用户流程测试

### 兼容性测试
- **浏览器兼容性**：Chrome、Firefox、Safari、Edge
- **操作系统兼容性**：Windows 10+、macOS 10.15+、Linux Ubuntu 20.04+
- **设备兼容性**：Cisco、Huawei、H3C主流设备型号

### 性能测试
- **负载测试**：高并发场景下的系统表现
- **压力测试**：系统极限承载能力测试
- **稳定性测试**：长时间运行的稳定性验证

## 📈 发展规划

### 短期目标（6-12个月）
- ✅ 完成MVP版本开发和发布
- ✅ 获取首批用户反馈
- ✅ 目标覆盖10-20家付费客户

### 中期目标（12-24个月）
- 🔄 完善功能，支持多厂商设备
- 🔄 扩展用户群体
- 🔄 目标覆盖100+中小企业客户

### 长期目标（24个月以上）
- 🌟 成为行业领先的网络自动化工具
- 🌟 支持云原生网络和SDN
- 🌟 探索订阅制、买断制和token计费的多模式盈利

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 遵循现有代码风格和架构设计
- 编写必要的单元测试
- 更新相关文档
- 确保所有测试通过

## 📞 联系方式

- **作者**：Jayce Lu
- **邮箱**：jayc_lu@foxmail.com
- **电话**：15320488098
- **微信公众号**：数字卢语
- **项目地址**：`/home/ubuntu/all-in-one`

## 📄 许可证

本项目采用私有许可证，未经授权不得用于商业用途。

## 🙏 致谢

感谢以下技术和工具的支持：

- [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- [Flask](https://flask.palletsprojects.com/) - Python Web框架
- [Tailwind CSS](https://tailwindcss.com/) - 现代化CSS框架
- [Iconify](https://iconify.design/) - 图标库
- [Paramiko](https://www.paramiko.org/) - SSH客户端库
- [SQLite](https://sqlite.org/) - 轻量级数据库

---

<div align="center">

**网络工程师一站式集成服务** © 2025

*让网络自动化变得简单而强大*

</div>