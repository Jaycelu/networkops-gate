# 软件包上传指南

## 目录结构

```
/downloads/
├── windows/                    # Windows平台安装包
│   └── network-ai-ops-setup-v1.0.0.exe
├── macos/                      # macOS平台安装包
│   ├── network-ai-ops-setup-v1.0.0-intel.dmg    # Intel芯片
│   └── network-ai-ops-setup-v1.0.0-arm64.dmg    # Apple Silicon芯片
└── README.md                   # 本文件
```

## 快速上传步骤

### 1. 准备安装包

确保你的软件包已编译好，并按照以下命名规范：

- Windows: `network-ai-ops-setup-v{版本号}.exe`
- macOS (Intel): `network-ai-ops-setup-v{版本号}-intel.dmg`
- macOS (Apple Silicon): `network-ai-ops-setup-v{版本号}-arm64.dmg`

### 2. 上传到服务器

#### 使用 SCP 命令（推荐）

```bash
# 上传Windows版本
scp network-ai-ops-setup-v1.0.0.exe ubuntu@your-server-ip:/home/ubuntu/all-in-one/web/downloads/windows/

# 上传macOS版本
scp network-ai-ops-setup-v1.0.0.dmg ubuntu@your-server-ip:/home/ubuntu/all-in-one/web/downloads/macos/
```

### 3. 设置文件权限

上传完成后，设置正确的文件权限：

```bash
sudo chmod 644 /home/ubuntu/all-in-one/web/downloads/windows/*
sudo chmod 644 /home/ubuntu/all-in-one/web/downloads/macos/*
sudo chown -R www-data:www-data /home/ubuntu/all-in-one/web/downloads
```

## 下载URL

上传完成后，文件可以通过以下URL访问：

- Windows: `https://jaycelu.online/downloads/windows/network-ai-ops-setup-v1.0.0.exe`
- macOS: `https://jaycelu.online/downloads/macos/network-ai-ops-setup-v1.0.0.dmg`

## 测试下载

在浏览器中直接访问下载URL测试，或通过官网的下载区域点击下载按钮。

---

**更新时间**：2026-02-04
