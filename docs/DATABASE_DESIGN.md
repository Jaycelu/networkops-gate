# 数据库设计文档

## 1. 数据库选型
选用SQLite作为开发阶段的数据库，轻量级且易于部署，满足当前项目需求。

## 2. 用户信息表设计

### 2.1 users表结构
| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户唯一标识 |
| username | VARCHAR(50) | NOT NULL UNIQUE | 用户名 |
| email | VARCHAR(100) | NOT NULL UNIQUE | 邮箱地址 |
| phone | VARCHAR(20) | NOT NULL UNIQUE | 手机号码 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希值 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 账户创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 最后更新时间 |

### 2.2 索引设计
- 主键索引：id
- 唯一索引：username, email, phone
- 普通索引：created_at

## 3. SQL建表语句

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## 4. 数据库访问接口设计

### 4.1 用户注册
```python
def create_user(username, email, phone, password):
    """
    创建新用户
    :param username: 用户名
    :param email: 邮箱
    :param phone: 手机号
    :param password: 密码（明文，函数内进行哈希处理）
    :return: 用户ID或None
    """
    pass
```

### 4.2 用户查询
```python
def get_user_by_id(user_id):
    """
    根据用户ID查询用户信息
    :param user_id: 用户ID
    :return: 用户信息字典或None
    """
    pass

def get_user_by_email(email):
    """
    根据邮箱查询用户信息
    :param email: 邮箱地址
    :return: 用户信息字典或None
    """
    pass

def get_user_by_phone(phone):
    """
    根据手机号查询用户信息
    :param phone: 手机号
    :return: 用户信息字典或None
    """
    pass

def get_user_by_username(username):
    """
    根据用户名查询用户信息
    :param username: 用户名
    :return: 用户信息字典或None
    """
    pass

def verify_user_password(username, password):
    """
    验证用户密码
    :param username: 用户名
    :param password: 明文密码
    :return: 用户信息字典或None
    """
    pass
```