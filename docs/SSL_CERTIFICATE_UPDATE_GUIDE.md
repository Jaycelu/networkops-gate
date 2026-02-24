# SSL证书更新与维护指南

## 概述
本文档提供了在服务器上更新和维护SSL证书的详细步骤和说明。

## 当前证书信息
- **域名**: jaycelu.online
- **证书文件**: jaycelu.online_bundle.crt (包含完整证书链)
- **私钥文件**: jaycelu.online.key
- **证书位置**: `/etc/nginx/ssl/jaycelu.online/`
- **Nginx配置**: `/etc/nginx/sites-available/jaycelu.online`

## 本次更新完成的操作

### 1. 证书文件处理
- 解压证书包: `jaycelu.online_nginx.zip`
- 证书文件复制到: `/etc/nginx/ssl/jaycelu.online/`
- 设置文件权限:
  - 私钥: `600` (仅所有者可读写)
  - 证书: `644` (所有者可读写，其他用户只读)

### 2. Nginx配置更新
- 更新证书路径配置
- 禁用默认站点配置
- 启用新的SSL配置
- 配置HTTP到HTTPS重定向

### 3. 服务重启
- 测试Nginx配置: `sudo nginx -t`
- 重启Nginx服务: `sudo systemctl restart nginx`

## 如何添加新的SSL证书

### 步骤1: 准备证书文件
1. 从证书颁发机构下载证书文件，通常包含:
   - 域名证书 (如: `domain.crt` 或 `domain_bundle.crt`)
   - 私钥文件 (如: `domain.key`)
   - 中间证书 (可能包含在bundle中)

2. 证书文件命名规范:
   - 证书: `域名_bundle.crt` (包含完整证书链)
   - 私钥: `域名.key`

### 步骤2: 上传证书到服务器
```bash
# 使用SCP上传 (从本地到服务器)
scp domain_bundle.crt domain.key user@server:/tmp/

# 或者直接在服务器下载
wget -O /tmp/domain_bundle.crt https://cert-provider.com/certificate
wget -O /tmp/domain.key https://cert-provider.com/private-key
```

### 步骤3: 安装证书
```bash
# 创建证书目录
sudo mkdir -p /etc/nginx/ssl/domain.com

# 复制证书文件
sudo cp /tmp/domain_bundle.crt /etc/nginx/ssl/domain.com/
sudo cp /tmp/domain.key /etc/nginx/ssl/domain.com/

# 设置文件权限
sudo chmod 600 /etc/nginx/ssl/domain.com/domain.key
sudo chmod 644 /etc/nginx/ssl/domain.com/domain_bundle.crt
```

### 步骤4: 创建Nginx配置
创建新的配置文件 `/etc/nginx/sites-available/domain.com`:

```nginx
server {
    listen 443 ssl;
    server_name domain.com www.domain.com;
    
    ssl_certificate /etc/nginx/ssl/domain.com/domain_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/domain.com/domain.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    root /path/to/your/webroot;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # 安全头设置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name domain.com www.domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 步骤5: 启用配置
```bash
# 创建符号链接
sudo ln -sf /etc/nginx/sites-available/domain.com /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 证书续期与更新

### 自动续期 (推荐使用Certbot)
```bash
# 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取并安装证书
sudo certbot --nginx -d domain.com -d www.domain.com

# 设置自动续期
sudo certbot renew --dry-run
```

### 手动更新
1. 从证书提供商获取新证书
2. 备份旧证书
3. 安装新证书 (参考步骤3)
4. 重启Nginx服务

## 故障排除

### 常见问题

#### 1. Nginx配置测试失败
```bash
# 检查语法错误
sudo nginx -t

# 查看详细错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 2. SSL证书验证失败
```bash
# 检查证书链
openssl x509 -in /etc/nginx/ssl/domain.com/domain_bundle.crt -text -noout

# 检查私钥匹配
openssl rsa -noout -modulus -in /etc/nginx/ssl/domain.com/domain.key | openssl md5
openssl x509 -noout -modulus -in /etc/nginx/ssl/domain.com/domain_bundle.crt | openssl md5
# 两个MD5值应该相同
```

#### 3. 证书过期检查
```bash
# 检查证书有效期
openssl x509 -in /etc/nginx/ssl/domain.com/domain_bundle.crt -dates -noout
```

### 紧急恢复
如果SSL配置出现问题，可以临时恢复HTTP:
```bash
# 禁用SSL配置
sudo rm /etc/nginx/sites-enabled/domain.com

# 启用HTTP配置
sudo ln -s /etc/nginx/sites-available/domain.com.http /etc/nginx/sites-enabled/

# 重启Nginx
sudo systemctl restart nginx
```

## 安全最佳实践

1. **定期更新**: 证书有效期通常为90天，设置自动续期
2. **权限管理**: 私钥文件权限设置为600
3. **备份策略**: 定期备份证书和私钥
4. **监控**: 设置证书过期提醒
5. **密钥轮换**: 定期更换私钥

## 相关命令参考

```bash
# 查看已安装的证书
ls -la /etc/nginx/ssl/

# 检查Nginx配置
sudo nginx -T | grep -A5 -B5 "ssl_certificate"

# 验证SSL连接
curl -vI https://domain.com
openssl s_client -connect domain.com:443 -servername domain.com

# 检查服务状态
sudo systemctl status nginx
sudo journalctl -u nginx --since "1 hour ago"
```

## 联系支持
如有问题，请联系系统管理员或参考:
- Nginx官方文档: https://nginx.org/en/docs/
- Let's Encrypt文档: https://letsencrypt.org/docs/
- SSL Labs测试: https://www.ssllabs.com/ssltest/