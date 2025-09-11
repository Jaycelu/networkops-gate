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
        if not os.path.exists(self.db_path):
            # 确保数据库目录存在
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            # 创建数据库和表
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # 创建用户表
            cursor.execute('''
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    phone VARCHAR(20) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    token_balance INTEGER DEFAULT 1000,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建索引
            cursor.execute('CREATE INDEX idx_users_username ON users(username)')
            cursor.execute('CREATE INDEX idx_users_email ON users(email)')
            cursor.execute('CREATE INDEX idx_users_phone ON users(phone)')
            cursor.execute('CREATE INDEX idx_users_created_at ON users(created_at)')
            
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
    
    def verify_user_password(self, username, password):
        """
        验证用户密码
        :param username: 用户名
        :param password: 明文密码
        :return: 用户信息字典或None
        """
        user = self.get_user_by_username(username)
        if user and user['password_hash'] == self.hash_password(password):
            return user
        return None
    
    def get_token_balance(self, user_id):
        """
        获取用户Token余额
        :param user_id: 用户ID
        :return: Token余额
        """
        user = self.get_user_by_id(user_id)
        if user:
            return user['token_balance']
        return None
    
    def update_token_balance(self, user_id, amount):
        """
        更新用户Token余额
        :param user_id: 用户ID
        :param amount: 变更数量（正数增加，负数减少）
        :return: 更新后的余额或None
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # 更新余额
            cursor.execute('''
                UPDATE users 
                SET token_balance = token_balance + ?, updated_at = ?
                WHERE id = ?
            ''', (amount, datetime.now(), user_id))
            
            # 获取更新后的余额
            cursor.execute('SELECT token_balance FROM users WHERE id = ?', (user_id,))
            result = cursor.fetchone()
            
            conn.commit()
            conn.close()
            
            if result:
                return result[0]
            return None
        except Exception as e:
            print(f"更新Token余额时发生错误: {e}")
            return None

# 全局数据库管理器实例
db_manager = DatabaseManager('/home/osadmin/network-ops/web-server/database/network_ops.db')