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

## 3. 本地预览

在 `web/` 目录运行：

```bash
cd web
python3 -m http.server 8080
```

访问：
- `http://127.0.0.1:8080/index.html`
- `http://127.0.0.1:8080/pages/tools.html`
- `http://127.0.0.1:8080/pages/downloads.html`

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

