# WSGI应用入口文件（生产环境）
import sys
import os

# 添加项目路径到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api import app

if __name__ == "__main__":
    app.run()