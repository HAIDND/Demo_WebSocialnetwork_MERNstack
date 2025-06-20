prepare code .py
prepare requirement.txt

# Các bước cài đặt

Hướng dẫn setup trên PythonAnywhere

1. Tạo tài khoản và upload code

Đăng ký tài khoản PythonAnywhere: https://www.pythonanywhere.com
Upload code:

Vào Dashboard → Files
Tạo folder cho project (ví dụ: recommendation_api)
Upload file Python đã sửa (lưu tên flask_app.py)

2. Cài đặt dependencies

Mở Bash Console từ Dashboard
Chạy các lệnh sau:

bash# Tạo virtual environment
mkvirtualenv --python=/usr/bin/python3.10 recommendation-env

# Kích hoạt virtual environment

workon recommendation-env

# Cài đặt các package cần thiết

pip install flask
pip install pymongo
pip install scikit-learn
pip install flask-cors
pip install dnspython # Cần thiết cho MongoDB Atlas 3. Tạo Web App

Vào Dashboard → Web
Click "Add a new web app"
Chọn:

Manual configuration
Python 3.10

Cấu hình WSGI file:

Vào Web tab → Code section
Click vào WSGI configuration file
Thay thế nội dung bằng:

WSGI ConfigurationCode import sys
import os

# Thêm đường dẫn project vào sys.path

path = '/home/yourusername/recommendation_api' # Thay 'yourusername' bằng username thực của bạn
if path not in sys.path:
sys.path.append(path)

# Import Flask app

from flask_app import 4. Cấu hình Virtual Environment

Vào Web tab → Virtualenv section
Nhập đường dẫn: /home/yourusername/.virtualenvs/recommendation-env
(Thay yourusername bằng username của bạn)

5. Cấu hình Static Files (nếu cần)

Vào Web tab → Static files section
Thêm mapping (không bắt buộc cho API):

URL: /static/
Directory: /home/yourusername/recommendation_api/static/

6. Reload và Test

Click "Reload" button trong Web tab
Truy cập URL: https://yourusername.pythonanywhere.com
Test các endpoint:

GET / - Trang chủ
GET /health - Health check
GET /recommend/0 - Content-based recommendation
GET /recommend-cf/USER_ID - Collaborative filtering

7. Các thay đổi quan trọng trong code
   Những gì đã sửa:

Error handling: Thêm try-catch cho tất cả functions
Health check endpoint: Kiểm tra trạng thái database và API
Lazy loading: Content-based filtering sẽ tự khởi tạo nếu chưa sẵn sàng
Debug mode: Tắt debug mode cho production
Input validation: Kiểm tra dữ liệu đầu vào
Memory optimization: Cache dữ liệu trong global variables
MongoDB connection: Tối ưu kết nối với MongoDB Atlas

8. Troubleshooting
   Nếu gặp lỗi:

Check Error Logs: Web tab → Log files → Error log
Check Server Log: Web tab → Log files → Server log
Common issues:

Import errors: Kiểm tra virtual environment
MongoDB connection: Kiểm tra connection string và whitelist IP
Memory limits: Free account có giới hạn memory

9. Testing Script
   import requests
   import json

# Thay bằng URL PythonAnywhere của bạn

BASE_URL = "https://yourusername.pythonanywhere.com"

def test_api():
"""Test các endpoint của API"""

    print("=== Testing Recommendation API ===\n")

    # Test 1: Health check
    print("1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Test 2: Home endpoint
    print("2. Testing home endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Test 3: Content-based recommendation
    print("3. Testing content-based recommendation...")
    try:
        response = requests.get(f"{BASE_URL}/recommend/0")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Query location: {data.get('query_location')}")
            print(f"Number of recommendations: {len(data.get('recommendations', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Test 4: Collaborative filtering (thay USER_ID bằng ID thật)
    print("4. Testing collaborative filtering...")
    try:
        # Thay 'test_user_id' bằng user ID thực tế từ database
        response = requests.get(f"{BASE_URL}/recommend-cf/test_user_id")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"User ID: {data.get('userId')}")
            print(f"Number of recommendations: {len(data.get('recommendations', []))}")
            print(f"Message: {data.get('message', 'Success')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if **name** == "**main**":
test_api() 10. Bảo mật
Lưu ý quan trọng:

Connection string MongoDB đã exposed trong code
Nên sử dụng environment variables:

pythonimport os
MONGO_URI = os.environ.get('MONGO_URI', 'your_default_connection_string')
client = MongoClient(MONGO_URI)

Thêm environment variable trong PythonAnywhere:

Files tab → .bashrc file
Thêm: export MONGO_URI="your_connection_string"
