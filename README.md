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

2. Nginx `server` 配置示例（关键是 `root` 指向 `web`，并启用压缩、缓存、安全头、访问日志）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/networkops-gate/web;
    index index.html;
    charset utf-8;

    # 访问与下载统计日志（供首页组件读取真实数据）
    log_format networkops_metrics '$time_local "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"';
    map $uri $is_visit_path {
        default 0;
        ~^/$ 1;
        ~^/index\.html$ 1;
        ~^/pages/(tools|tool|downloads)\.html$ 1;
    }
    map $uri $is_download_path {
        default 0;
        ~^/downloads/[a-z0-9-]+/ 1;
    }
    access_log /var/log/nginx/networkops_access.log networkops_metrics if=$is_visit_path;
    access_log /var/log/nginx/networkops_download.log networkops_metrics if=$is_download_path;

    # 启用 gzip 压缩，降低传输体积
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # 安全响应头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;

    # HTML 不做长期缓存，确保内容更新可见
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires -1;
    }

    # 静态资源强缓存（文件名不变时会命中浏览器缓存）
    location ~* \.(?:css|js|json|png|jpg|jpeg|gif|svg|ico|webp)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        expires 365d;
    }

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
- 在浏览器开发者工具中确认：
  - `index.html` 返回 `Cache-Control: no-cache, no-store, must-revalidate`
  - `site.css` / `app.js` 返回 `Cache-Control: public, max-age=31536000, immutable`
  - 页面响应头包含 `Content-Security-Policy`、`X-Content-Type-Options`、`Referrer-Policy`

### 3.3 本次安全与性能优化后，你在 Nginx 必须修改的项

如果你已有线上 `server` 块，至少补充这 6 项：

1. 增加 gzip 配置（`gzip on`、`gzip_types`、`gzip_comp_level`）。
2. 增加 `location ~* \.html$`，设置 `Cache-Control: no-cache, no-store, must-revalidate`。
3. 增加 `location ~* \.(?:css|js|json|png|jpg|jpeg|gif|svg|ico|webp)$`，设置 `Cache-Control: public, max-age=31536000, immutable`。
4. 增加安全响应头（`CSP`、`X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy`）。
5. 配置 `networkops_access.log` 与 `networkops_download.log` 两类日志输出。
6. 保留 `location / { try_files $uri $uri/ /index.html; }`。

改完后执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3.4 将 Nginx 真实日志接入首页右侧统计组件

首页“每日访问与下载记录”组件支持两种数据源：
- 默认：浏览器本地统计（`localStorage`）
- 推荐：服务器真实统计（`web/data/metrics.json`，由 Nginx 日志生成）

当 `web/data/metrics.json` 存在时，组件会优先展示真实数据。

1. 使用本仓库脚本从 Nginx 日志生成 `metrics.json`：

```bash
cd /var/www/networkops-gate
python3 scripts/generate_metrics_from_nginx.py \
  --log /var/log/nginx/networkops_access.log /var/log/nginx/networkops_download.log \
  --output web/data/metrics.json
```

2. 配置定时任务（每 5 分钟刷新一次）：

```bash
*/5 * * * * cd /var/www/networkops-gate && /usr/bin/python3 scripts/generate_metrics_from_nginx.py --log /var/log/nginx/networkops_access.log /var/log/nginx/networkops_download.log --output web/data/metrics.json >/tmp/networkops_metrics.log 2>&1
```

3. 验证真实数据已接入：
- 访问几次 `index.html` 和 `pages/*.html`
- 点击一两个安装包下载链接
- 执行一次脚本后，检查 `web/data/metrics.json` 中 `visitsByDate` 与 `downloadsByTool` 是否变化
- 刷新首页，右侧统计组件应显示对应真实计数

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
- 页面静态资源启用了版本号（当前：`20260228`）。当你更新 `web/css/site.css`、`web/js/app.js` 或 `web/data/tools.json` 时，请同步更新四个 HTML 文件里的资源 URL 上的 `?v=...` 参数。
- 若你修改了 `web/data/tools.json`，请同步更新 `web/js/app.js` 中的 `EXPECTED_TOOLS_HASH`（可执行：`shasum -a 256 web/data/tools.json`）。
- 下载链接白名单已启用：仅允许本站 ` /downloads/<tool-slug>/... ` 路径，非法/越界链接会在页面显示“已拦截”。

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
