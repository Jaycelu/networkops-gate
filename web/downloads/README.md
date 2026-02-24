# 下载目录规范

本目录用于静态文件直链下载，按 `工具 -> 平台 -> 版本` 分类。

## 目录结构

```text
downloads/
  <tool-slug>/
    windows/
      v1.0.0/
        installer.exe
    macos/
      v1.0.0/
        installer.dmg
```

## 发布步骤

1. 上传安装包到对应目录。
2. 更新 `../data/tools.json` 中该工具的 `downloads` 条目。
3. 重新部署静态站点。

无需后端服务即可完成下载分发。
