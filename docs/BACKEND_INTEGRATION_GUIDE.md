# 后端集成设计文档

## 1. 数据库结构

### 用户表 (users)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    token_balance INTEGER DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 索引设计
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## 2. API接口规范

### 基础信息
- **服务器地址**: `http://your-server-ip:9528`
- **请求格式**: JSON
- **响应格式**: JSON
- **跨域支持**: 已启用CORS

### 2.1 用户注册

**接口地址**: `POST /api/register`

**请求参数**:
```json
{
    "username": "testuser",
    "phone": "13800138000",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
}
```

**响应成功**:
```json
{
    "success": true,
    "message": "注册成功！已赠送1000个免费Token",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "phone": "13800138000",
        "token_balance": 1000
    }
}
```

**响应失败**:
```json
{
    "success": false,
    "message": "用户名已存在"
}
```

**验证规则**:
- 所有字段必填
- 密码长度至少6位
- 两次密码输入必须一致
- 手机号格式：中国大陆手机号（11位，以1开头）
- 用户名、邮箱、手机号全局唯一

### 2.2 用户登录

**接口地址**: `POST /api/login`

**请求参数**:
```json
{
    "username": "testuser",  // 可以是用户名、邮箱或手机号
    "password": "password123"
}
```

**响应成功**:
```json
{
    "success": true,
    "message": "登录成功",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "phone": "13800138000",
        "token_balance": 1000
    }
}
```

**响应失败**:
```json
{
    "success": false,
    "message": "账号或密码错误"
}
```

**登录逻辑**:
- 支持用户名、邮箱、手机号三种登录方式
- 自动识别登录标识符类型
- 包含@符号：邮箱登录
- 纯数字且长度≥10：手机号登录
- 其他：用户名登录

### 2.3 获取用户信息

**接口地址**: `GET /api/user/{user_id}`

**响应成功**:
```json
{
    "success": true,
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "phone": "13800138000",
        "token_balance": 1000
    }
}
```

## 3. 桌面应用程序集成

### 3.1 网络连接配置

```python
# config.py
class Config:
    # API服务器配置
    API_BASE_URL = "http://your-server-ip:9528/api"
    
    # 请求超时时间（秒）
    REQUEST_TIMEOUT = 30
    
    # 重试次数
    MAX_RETRIES = 3
    
    # 本地缓存配置
    CACHE_DIR = "./cache"
    TOKEN_CACHE_FILE = "./cache/token.json"
```

### 3.2 HTTP请求工具类

```python
# network_client.py
import requests
import json
import time
from config import Config

class NetworkClient:
    def __init__(self):
        self.base_url = Config.API_BASE_URL
        self.timeout = Config.REQUEST_TIMEOUT
        self.max_retries = Config.MAX_RETRIES
        self.session = requests.Session()
        
        # 设置默认请求头
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'NetworkOps-Desktop/1.0'
        })
    
    def make_request(self, method, endpoint, data=None, params=None):
        """
        发送HTTP请求，带重试机制
        """
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    timeout=self.timeout
                )
                
                # 检查响应状态
                if response.status_code == 200:
                    return response.json()
                else:
                    # 非200状态码，尝试解析错误信息
                    try:
                        error_data = response.json()
                        return {
                            'success': False,
                            'message': error_data.get('message', f'HTTP {response.status_code}')
                        }
                    except:
                        return {
                            'success': False,
                            'message': f'HTTP {response.status_code}'
                        }
                        
            except requests.exceptions.Timeout:
                if attempt < self.max_retries - 1:
                    time.sleep(1)  # 等待1秒后重试
                    continue
                return {
                    'success': False,
                    'message': '请求超时，请检查网络连接'
                }
                
            except requests.exceptions.ConnectionError:
                return {
                    'success': False,
                    'message': '无法连接到服务器，请检查服务器地址'
                }
                
            except Exception as e:
                return {
                    'success': False,
                    'message': f'网络错误: {str(e)}'
                }
        
        return {
            'success': False,
            'message': '请求失败，请稍后重试'
        }
```

### 3.3 用户认证管理器

```python
# auth_manager.py
import json
import os
from datetime import datetime, timedelta
from network_client import NetworkClient
from config import Config

class AuthManager:
    def __init__(self):
        self.network_client = NetworkClient()
        self.current_user = None
        self.token_expiry = None
        
        # 确保缓存目录存在
        os.makedirs(Config.CACHE_DIR, exist_ok=True)
        
        # 加载本地缓存的用户信息
        self.load_cached_user()
    
    def register(self, username, phone, email, password, confirm_password):
        """
        用户注册
        """
        # 本地验证
        if password != confirm_password:
            return {
                'success': False,
                'message': '两次输入的密码不一致'
            }
        
        if len(password) < 6:
            return {
                'success': False,
                'message': '密码长度至少为6位'
            }
        
        # 验证手机号格式
        import re
        if not re.match(r'^1[3-9]\d{9}$', phone):
            return {
                'success': False,
                'message': '手机号格式不正确'
            }
        
        # 发送注册请求
        data = {
            'username': username,
            'phone': phone,
            'email': email,
            'password': password,
            'confirmPassword': confirm_password
        }
        
        result = self.network_client.make_request('POST', '/register', data)
        
        if result.get('success'):
            # 注册成功，自动登录
            user_data = result.get('user')
            self.save_user_to_cache(user_data)
            self.current_user = user_data
        
        return result
    
    def login(self, login_identifier, password):
        """
        用户登录
        """
        data = {
            'username': login_identifier,  # 可以是用户名、邮箱或手机号
            'password': password
        }
        
        result = self.network_client.make_request('POST', '/login', data)
        
        if result.get('success'):
            # 登录成功，保存用户信息
            user_data = result.get('user')
            self.save_user_to_cache(user_data)
            self.current_user = user_data
            self.token_expiry = datetime.now() + timedelta(days=7)  # 7天有效期
        
        return result
    
    def logout(self):
        """
        用户登出
        """
        self.current_user = None
        self.token_expiry = None
        
        # 清除本地缓存
        if os.path.exists(Config.TOKEN_CACHE_FILE):
            os.remove(Config.TOKEN_CACHE_FILE)
    
    def is_authenticated(self):
        """
        检查用户是否已登录且未过期
        """
        if not self.current_user:
            return False
        
        if self.token_expiry and datetime.now() > self.token_expiry:
            self.logout()
            return False
        
        return True
    
    def get_current_user(self):
        """
        获取当前登录用户的信息
        """
        return self.current_user
    
    def save_user_to_cache(self, user_data):
        """
        保存用户信息到本地缓存
        """
        cache_data = {
            'user': user_data,
            'expiry': (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        try:
            with open(Config.TOKEN_CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存用户信息缓存失败: {e}")
    
    def load_cached_user(self):
        """
        从本地缓存加载用户信息
        """
        if not os.path.exists(Config.TOKEN_CACHE_FILE):
            return
        
        try:
            with open(Config.TOKEN_CACHE_FILE, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            # 检查过期时间
            expiry_str = cache_data.get('expiry')
            if expiry_str:
                expiry = datetime.fromisoformat(expiry_str)
                if datetime.now() <= expiry:
                    self.current_user = cache_data.get('user')
                    self.token_expiry = expiry
                else:
                    # 已过期，删除缓存文件
                    os.remove(Config.TOKEN_CACHE_FILE)
        except Exception as e:
            print(f"加载用户信息缓存失败: {e}")
```

### 3.4 使用示例

```python
# main.py
from auth_manager import AuthManager

class NetworkOpsApp:
    def __init__(self):
        self.auth_manager = AuthManager()
    
    def show_login_dialog(self):
        """
        显示登录对话框
        """
        # 检查是否已登录
        if self.auth_manager.is_authenticated():
            user = self.auth_manager.get_current_user()
            print(f"已登录用户: {user['username']}")
            return True
        
        # 显示登录界面
        login_identifier = input("请输入用户名/邮箱/手机号: ")
        password = input("请输入密码: ")
        
        result = self.auth_manager.login(login_identifier, password)
        
        if result.get('success'):
            print("登录成功!")
            user = result.get('user')
            print(f"欢迎, {user['username']}!")
            print(f"Token余额: {user['token_balance']}")
            return True
        else:
            print(f"登录失败: {result.get('message')}")
            return False
    
    def show_register_dialog(self):
        """
        显示注册对话框
        """
        print("=== 用户注册 ===")
        username = input("用户名: ")
        phone = input("手机号: ")
        email = input("邮箱: ")
        password = input("密码: ")
        confirm_password = input("确认密码: ")
        
        result = self.auth_manager.register(username, phone, email, password, confirm_password)
        
        if result.get('success'):
            print("注册成功!")
            user = result.get('user')
            print(f"欢迎加入, {user['username']}!")
            print(f"获得免费Token: {user['token_balance']}")
            return True
        else:
            print(f"注册失败: {result.get('message')}")
            return False

# 应用程序入口
if __name__ == "__main__":
    app = NetworkOpsApp()
    
    while True:
        print("\n=== 网络运维工具 ===")
        print("1. 登录")
        print("2. 注册")
        print("3. 退出")
        
        choice = input("请选择操作: ")
        
        if choice == "1":
            if app.show_login_dialog():
                # 登录成功，进入主程序
                print("进入主程序...")
                break
        elif choice == "2":
            app.show_register_dialog()
        elif choice == "3":
            break
        else:
            print("无效选择，请重试")
```

## 4. 安全考虑

### 4.1 密码安全
- 密码在服务器端使用SHA-256哈希存储
- 传输过程中使用HTTPS（生产环境）
- 密码最小长度限制为6位

### 4.2 网络安全
- 启用CORS跨域请求支持
- 请求超时保护（30秒）
- 自动重试机制（最多3次）
- 本地用户信息缓存加密（可扩展）

### 4.3 数据保护
- 用户敏感信息（密码）不返回给客户端
- 本地缓存文件权限控制
- 7天自动过期机制

## 5. 错误处理

### 5.1 网络错误
```python
{
    "success": False,
    "message": "无法连接到服务器，请检查服务器地址"
}
```

### 5.2 超时错误
```python
{
    "success": False,
    "message": "请求超时，请检查网络连接"
}
```

### 5.3 业务错误
```python
{
    "success": False,
    "message": "用户名已存在"
}
```

## 6. 部署建议

### 6.1 服务器配置
- 使用Nginx反向代理Flask应用
- 配置HTTPS证书
- 设置防火墙规则（仅开放必要端口）

### 6.2 数据库备份
- 定期备份SQLite数据库文件
- 监控数据库文件大小
- 考虑升级到PostgreSQL（用户量增大时）

### 6.3 监控建议
- 记录API请求日志
- 监控用户注册/登录成功率
- 设置告警机制（如数据库连接失败）

## 7. 扩展功能

### 7.1 会话管理
- JWT Token认证
- 刷新Token机制
- 单设备登录限制

### 7.2 用户权限
- 角色权限管理
- 功能访问控制
- 管理员后台

### 7.3 安全增强
- 登录验证码
- 密码强度检测
- 异常登录提醒