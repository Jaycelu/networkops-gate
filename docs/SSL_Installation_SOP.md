# SSL证书安装SOP文档

## 1. 证书文件说明

解压后的SSL证书文件包含以下内容：
- `jaycelu.online.csr`: 证书签名请求文件
- `jaycelu.online_bundle.crt`: 证书链文件（Apache用）
- `jaycelu.online_bundle.pem`: 证书链文件（Nginx用）
- `jaycelu.online.key`: 私钥文件

## 2. Nginx服务器SSL证书安装步骤

1. 将证书文件复制到Nginx配置目录：
   ```bash
   sudo mkdir -p /etc/nginx/ssl
   sudo cp jaycelu.online_bundle.pem /etc/nginx/ssl/jaycelu.online.crt
   sudo cp jaycelu.online.key /etc/nginx/ssl/jaycelu.online.key
   ```

2. 修改Nginx配置文件，在server块中添加SSL配置：
   ```nginx
   server {
       listen 443 ssl;
       server_name jaycelu.online;
       
       ssl_certificate /etc/nginx/ssl/jaycelu.online.crt;
       ssl_certificate_key /etc/nginx/ssl/jaycelu.online.key;
       
       # 其他SSL安全配置
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;
       
       # 原有配置...
       root /home/osadmin/network-ops/web-server;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   
   # HTTP重定向到HTTPS
   server {
       listen 80;
       server_name jaycelu.online;
       return 301 https://$server_name$request_uri;
   }
   ```

3. 测试Nginx配置并重新加载：
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 3. 后续添加SSL证书流程

1. 获取新的SSL证书文件（通常包括证书文件和私钥文件）
2. 将新证书文件复制到服务器的SSL目录：
   ```bash
   sudo cp new_certificate.crt /etc/nginx/ssl/
   sudo cp new_private.key /etc/nginx/ssl/
   ```
3. 更新Nginx配置文件中的证书路径
4. 测试配置并重新加载Nginx：
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```
5. 验证新证书是否生效

## 4. 注意事项

- 确保证书文件权限设置正确，私钥文件只能被root用户读取：
  ```bash
   sudo chmod 600 /etc/nginx/ssl/*.key
   sudo chmod 644 /etc/nginx/ssl/*.crt
   ```
- 定期检查证书有效期，及时更新即将过期的证书
- 备份原有证书和配置文件，以便在出现问题时回滚