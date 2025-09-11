# 后端API服务

import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# 添加数据库模块路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'database'))
from db_manager import db_manager

app = Flask(__name__)
CORS(app)  # 允许跨域请求

@app.route('/api/register', methods=['POST'])
def register():
    """
    用户注册接口
    """
    try:
        # 获取请求数据
        data = request.get_json()
        username = data.get('username')
        phone = data.get('phone')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirmPassword')
        
        # 验证必填字段
        if not all([username, phone, email, password, confirm_password]):
            return jsonify({'success': False, 'message': '所有字段都是必填的'}), 400
        
        # 验证密码一致性
        if password != confirm_password:
            return jsonify({'success': False, 'message': '两次输入的密码不一致'}), 400
        
        # 验证密码长度
        if len(password) < 6:
            return jsonify({'success': False, 'message': '密码长度至少为6位'}), 400
        
        # 验证手机号格式
        import re
        if not re.match(r'^1[3-9]\d{9}$', phone):
            return jsonify({'success': False, 'message': '手机号格式不正确'}), 400
        
        # 检查用户名是否已存在
        if db_manager.get_user_by_username(username):
            return jsonify({'success': False, 'message': '用户名已存在'}), 400
        
        # 检查邮箱是否已存在
        if db_manager.get_user_by_email(email):
            return jsonify({'success': False, 'message': '邮箱已被注册'}), 400
        
        # 检查手机号是否已存在
        if db_manager.get_user_by_phone(phone):
            return jsonify({'success': False, 'message': '手机号已被注册'}), 400
        
        # 创建用户
        user_id = db_manager.create_user(username, email, phone, password)
        if user_id:
            # 注册成功，返回用户信息
            user = db_manager.get_user_by_id(user_id)
            return jsonify({
                'success': True, 
                'message': '注册成功！已赠送1000个免费Token', 
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'token_balance': user['token_balance']
                }
            }), 201
        else:
            return jsonify({'success': False, 'message': '注册失败，请稍后重试'}), 500
    
    except Exception as e:
        print(f"注册时发生错误: {e}")
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """
    用户登录接口
    """
    try:
        # 获取请求数据
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # 验证必填字段
        if not all([username, password]):
            return jsonify({'success': False, 'message': '用户名和密码都是必填的'}), 400
        
        # 验证用户密码
        user = db_manager.verify_user_password(username, password)
        if user:
            return jsonify({
                'success': True, 
                'message': '登录成功', 
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'token_balance': user['token_balance']
                }
            }), 200
        else:
            return jsonify({'success': False, 'message': '用户名或密码错误'}), 401
    
    except Exception as e:
        print(f"登录时发生错误: {e}")
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    获取用户信息接口
    """
    try:
        user = db_manager.get_user_by_id(user_id)
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'token_balance': user['token_balance']
                }
            }), 200
        else:
            return jsonify({'success': False, 'message': '用户不存在'}), 404
    
    except Exception as e:
        print(f"获取用户信息时发生错误: {e}")
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9528, debug=True)