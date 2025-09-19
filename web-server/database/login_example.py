#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
用户登录验证示例代码
"""

import sys
import os

# 添加项目路径到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from db_manager import DatabaseManager

def login_user(login_identifier, password):
    """
    用户登录验证函数
    :param login_identifier: 登录标识符（可以是用户名、邮箱或手机号）
    :param password: 明文密码
    :return: 登录结果字典
    """
    # 初始化数据库管理器
    db_manager = DatabaseManager('/home/ubuntu/all-in-one/web-server/database/network_ops.db')
    
    # 验证用户密码
    user = db_manager.verify_user_password(login_identifier, password)
    
    if user:
        return {
            'success': True,
            'message': '登录成功',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'phone': user['phone'],
                'created_at': user['created_at']
            }
        }
    else:
        return {
            'success': False,
            'message': '登录失败，用户名或密码错误'
        }

def register_and_verify_user(username, email, phone, password):
    """
    用户注册后验证流程示例
    :param username: 用户名
    :param email: 邮箱
    :param phone: 手机号
    :param password: 密码
    :return: 注册和验证结果字典
    """
    # 初始化数据库管理器
    db_manager = DatabaseManager('/home/ubuntu/all-in-one/web-server/database/network_ops.db')
    
    # 创建新用户
    user_id = db_manager.create_user(username, email, phone, password)
    
    if user_id:
        # 注册成功后查询用户信息进行验证
        user = db_manager.get_user_by_id(user_id)
        if user:
            return {
                'success': True,
                'message': '用户注册成功并验证通过',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'created_at': user['created_at']
                }
            }
        else:
            return {
                'success': False,
                'message': '用户注册成功但信息验证失败'
            }
    else:
        return {
            'success': False,
            'message': '用户注册失败，可能用户名、邮箱或手机号已存在'
        }

# 测试代码
if __name__ == "__main__":
    # 测试登录功能（使用不同方式登录）
    print("=== 用户登录测试 ===")
    
    # 使用用户名登录
    result = login_user('ljz', 'ljz2025..')
    print(f"用户名登录: {result}")
    
    # 使用邮箱登录
    result = login_user('ljz@example.com', 'ljz2025..')
    print(f"邮箱登录: {result}")
    
    # 使用手机号登录
    result = login_user('13800138000', 'ljz2025..')
    print(f"手机号登录: {result}")
    
    # 测试错误密码
    result = login_user('ljz', 'wrongpassword')
    print(f"错误密码登录: {result}")
    
    print("\n=== 用户注册后验证测试 ===")
    # 测试注册新用户并验证
    result = register_and_verify_user('testuser', 'test@example.com', '13800138001', 'testpassword123')
    print(f"新用户注册: {result}")