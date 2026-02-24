# NetworkOps 工具站

面向网络工程场景的静态工具目录与下载站。

当前站点支持：
- 工具总览（首页默认展示工具详情并支持切换）
- 工具目录（多工具列表）
- 工具详情页（模块说明、场景、系统要求、版本更新）
- 下载中心（按工具/平台/版本展示安装包）

## 1. 当前技术架构

- 站点类型：纯静态站点（无业务后端）
- 前端：HTML + CSS + JavaScript
- 数据源：`web/data/tools.json`
- 下载分发：静态文件直链（`web/downloads/`）

## 2. 目录结构

```text
networkops-gate/
├── README.md
└── web/
    ├── index.html
    ├── css/
    │   └── site.css
    ├── js/
    │   └── app.js
    ├── pages/
    │   ├── tools.html
    │   ├── tool.html
    │   └── downloads.html
    ├── data/
    │   └── tools.json
    ├── downloads/
    │   ├── README.md
    │   └── <tool-slug>/
    │       ├── windows/
    │       │   └── <version>/
    │       ├── macos/
    │       │   └── <version>/
    │       └── linux/
    │           └── <version>/
    ├── 公众号.jpg
    └── 公安图标.png
```

## 3. 启动与部署

### 3.1 本地启动（开发预览）

在 `web/` 目录运行：

```bash
cd web
python3 -m http.server 8080
```

访问：
- `http://127.0.0.1:8080/index.html`
- `http://127.0.0.1:8080/pages/tools.html`
- `http://127.0.0.1:8080/pages/downloads.html`

### 3.2 服务器启动（Nginx 托管前端）

目标：确保官网由本项目 `web/` 目录作为站点根目录提供服务。

1. 将仓库部署到服务器，例如：

```text
/var/www/networkops-gate/
```

2. Nginx `server` 配置示例（关键是 `root` 指向 `web`）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/networkops-gate/web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. 检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

4. 验证线上页面是否来自当前前端目录：
- 打开 `https://your-domain.com/index.html`
- 检查是否能访问 `https://your-domain.com/pages/tools.html`
- 检查下载链接是否返回对应安装包文件

## 4. 新增/更新工具的标准流程

### 4.1 第一步：准备工具标识（slug）

`slug` 规则：
- 全小写
- 仅使用字母、数字、连字符 `-`
- 不使用空格、下划线、中文

示例：
- `network-ai-ops`
- `netops-ai-platform`

### 4.2 第二步：上传安装包到规范目录

目录规则：

```text
web/downloads/<tool-slug>/<platform>/<version>/<filename>
```

其中：
- `<platform>`：`windows` / `macos` / `linux`
- `<version>`：建议 `vX.Y.Z`（如 `v1.0.0`）

示例：

```text
web/downloads/network-ai-ops/windows/v1.1.0/network-ai-ops-setup-v1.1.0.exe
web/downloads/network-ai-ops/macos/v1.1.0/network-ai-ops-setup-v1.1.0.dmg
web/downloads/netops-ai-platform/linux/v2.0.0/netops-ai-platform-v2.0.0-amd64.tar.gz
```

### 4.3 第三步：安装包命名规范（必须遵守）

推荐命名：

```text
<tool-slug>-setup-<version>.<ext>
```

按平台建议：
- Windows：`.exe` 或 `.msi`
- macOS：`.dmg`
- Linux：`.AppImage` / `.tar.gz` / `.deb`

示例：
- `network-ai-ops-setup-v1.0.0.exe`
- `network-ai-ops-setup-v1.0.0.dmg`
- `netops-ai-platform-setup-v2.0.0.AppImage`

### 4.4 第四步：更新 `web/data/tools.json`

在对应工具对象的 `downloads` 数组中增加条目：

```json
{
  "version": "v1.1.0",
  "date": "2026-02-24",
  "platform": "Windows",
  "arch": "x64",
  "size": "120MB",
  "filename": "network-ai-ops-setup-v1.1.0.exe",
  "path": "./downloads/network-ai-ops/windows/v1.1.0/network-ai-ops-setup-v1.1.0.exe"
}
```

关键字段约束：
- `filename` 必须与实际文件名完全一致（区分大小写）
- `path` 必须与实际相对路径完全一致
- `platform` 必须与目录平台语义对应（Windows/macOS/Linux）

### 4.5 第五步：验证

1. 打开首页，确认工具切换与内容正常。
2. 打开工具详情页，确认“前往下载中心”正常。
3. 打开下载中心，确认下载链接可点击并能下载。

## 5. 新增一个全新工具（不仅仅是版本）

在 `web/data/tools.json` 的 `tools` 数组中新增一个对象，至少包含：
- `slug`
- `name`
- `tagline`
- `category`
- `status`
- `summary`
- `highlights`
- `capabilities`
- `scenarios`
- `requirements`
- `downloads`
- `changelog`

说明：
- 如果暂时没有安装包，`downloads` 可设为 `[]`。
- 上传安装包后再补充 `downloads` 条目即可。

## 6. 维护注意事项

- 站点无后端依赖，不需要启动 API 服务。
- 变更下载包时，优先新增版本目录，不覆盖历史版本。
- 备案链接固定使用：`https://beian.miit.gov.cn`
- 若页面更新后看不到变化，浏览器强制刷新（`Cmd+Shift+R`）。

## 7. Git 推送常见问题

### 7.1 报错：`No git remote configured for push`

含义：当前所在仓库没有可用于 push 的远端配置，或你在错误目录执行了 `git push`。

先检查当前目录与远端：

```bash
pwd
git rev-parse --show-toplevel
git remote -v
```

如果没有远端，执行：

```bash
git remote add origin https://github.com/Jaycelu/networkops-gate.git
```

首次推送并建立上游分支：

```bash
git push -u origin main
```

后续常规推送：

```bash
git push origin main
```

如果你使用 GUI 的 Commit/Push 按钮报这个错，通常也是因为 GUI 打开的项目目录不是这个仓库根目录，请切换到：

```text
/Users/jayce/Desktop/Jayce/networkops-gate
```
