# 数据库访问接口模块

import sqlite3
import hashlib
import os
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path):
        """
        初始化数据库管理器
        :param db_path: 数据库文件路径
        """
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """
        获取数据库连接
        :return: 数据库连接对象
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 使结果可以通过列名访问
        return conn
    
    def init_database(self):
        """
        初始化数据库（如果不存在则创建）
        """
        # 确保数据库目录存在
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        # 创建数据库和表（如果表不存在）
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # 创建用户表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(20) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)')
        
        conn.commit()
        conn.close()
    
    def hash_password(self, password):
        """
        对密码进行哈希处理
        :param password: 明文密码
        :return: 哈希后的密码
        """
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    def create_user(self, username, email, phone, password):
        """
        创建新用户
        :param username: 用户名
        :param email: 邮箱
        :param phone: 手机号
        :param password: 密码（明文）
        :return: 用户ID或None
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # 插入新用户
            cursor.execute('''
                INSERT INTO users (username, email, phone, password_hash)
                VALUES (?, ?, ?, ?)
            ''', (username, email, phone, self.hash_password(password)))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return user_id
        except sqlite3.IntegrityError as e:
            # 处理唯一性约束违反（用户名、邮箱或手机号已存在）
            print(f"创建用户失败: {e}")
            return None
        except Exception as e:
            print(f"创建用户时发生错误: {e}")
            return None
    
    def get_user_by_id(self, user_id):
        """
        根据用户ID查询用户信息
        :param user_id: 用户ID
        :return: 用户信息字典或None
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        conn.close()
        
        if user:
            return dict(user)
        return None
    
    def get_user_by_email(self, email):
        """
        根据邮箱查询用户信息
        :param email: 邮箱地址
        :return: 用户信息字典或None
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        conn.close()
        
        if user:
            return dict(user)
        return None
    
    def get_user_by_phone(self, phone):
        """
        根据手机号查询用户信息
        :param phone: 手机号
        :return: 用户信息字典或None
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE phone = ?', (phone,))
        user = cursor.fetchone()
        
        conn.close()
        
        if user:
            return dict(user)
        return None
    
    def get_user_by_username(self, username):
        """
        根据用户名查询用户信息
        :param username: 用户名
        :return: 用户信息字典或None
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        conn.close()
        
        if user:
            return dict(user)
        return None
    
    def verify_user_password(self, login_identifier, password):
        """
        验证用户密码（支持用户名、邮箱或手机号登录）
        :param login_identifier: 登录标识符（可以是用户名、邮箱或手机号）
        :param password: 明文密码
        :return: 用户信息字典或None
        """
        # 根据输入的标识符类型查询用户
        user = None
        if '@' in login_identifier:
            # 包含@符号，认为是邮箱
            user = self.get_user_by_email(login_identifier)
        elif login_identifier.isdigit() and len(login_identifier) >= 10:
            # 纯数字且长度至少为10位，认为是手机号
            user = self.get_user_by_phone(login_identifier)
        else:
            # 其他情况认为是用户名
            user = self.get_user_by_username(login_identifier)
        
        # 验证密码
        if user and user['password_hash'] == self.hash_password(password):
            return user
        return None
    
    

# 全局数据库管理器实例
db_manager = DatabaseManager('/home/ubuntu/all-in-one/web-server/database/network_ops.db')