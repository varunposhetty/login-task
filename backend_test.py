import requests
import sys
import json
from datetime import datetime, timedelta
import os

class TaskManagerAPITester:
    def __init__(self, base_url=None):
        self.base_url = base_url or os.environ.get('TASK_MANAGER_API_URL', 'http://127.0.0.1:8000')
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        cleaned_base = self.base_url.rstrip('/')
        cleaned_endpoint = endpoint.lstrip('/')
        url = f"{cleaned_base}/api/{cleaned_endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Expected {expected_status}, got {response.status_code}"
            if not success and response.text:
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', response.text)}"
                except:
                    details += f" - {response.text[:100]}"

            self.log_test(name, success, details if not success else "")
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_auth_signup(self):
        """Test user signup"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "Auth - Signup",
            "POST",
            "auth/signup",
            200,
            data=test_user
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True, test_user
        return False, test_user

    def test_auth_login(self):
        """Test user login with existing test user"""
        login_data = {
            "email": os.environ.get('TEST_USER_EMAIL', 'test@example.com'),
            "password": os.environ.get('TEST_USER_PASSWORD', 'password123')
        }
        
        success, response = self.run_test(
            "Auth - Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        success, _ = self.run_test(
            "Auth - Get Me",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_tasks_create(self):
        """Test task creation"""
        task_data = {
            "title": "Test Task",
            "description": "This is a test task",
            "status": "todo",
            "priority": "high",
            "due_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        }
        
        success, response = self.run_test(
            "Tasks - Create",
            "POST",
            "tasks",
            200,
            data=task_data
        )
        
        return response.get('id') if success else None

    def test_tasks_list(self):
        """Test task listing"""
        success, response = self.run_test(
            "Tasks - List",
            "GET",
            "tasks",
            200
        )
        return success, response

    def test_tasks_list_with_filters(self):
        """Test task listing with filters"""
        # Test status filter
        success, _ = self.run_test(
            "Tasks - List with Status Filter",
            "GET",
            "tasks?status=todo",
            200
        )
        
        # Test priority filter
        success2, _ = self.run_test(
            "Tasks - List with Priority Filter",
            "GET",
            "tasks?priority=high",
            200
        )
        
        # Test search
        success3, _ = self.run_test(
            "Tasks - List with Search",
            "GET",
            "tasks?search=test",
            200
        )
        
        return success and success2 and success3

    def test_tasks_update(self, task_id):
        """Test task update"""
        if not task_id:
            self.log_test("Tasks - Update", False, "No task ID provided")
            return False
            
        update_data = {
            "title": "Updated Test Task",
            "status": "in_progress",
            "priority": "medium"
        }
        
        success, _ = self.run_test(
            "Tasks - Update",
            "PUT",
            f"tasks/{task_id}",
            200,
            data=update_data
        )
        return success

    def test_tasks_delete(self, task_id):
        """Test task deletion"""
        if not task_id:
            self.log_test("Tasks - Delete", False, "No task ID provided")
            return False
            
        success, _ = self.run_test(
            "Tasks - Delete",
            "DELETE",
            f"tasks/{task_id}",
            200
        )
        return success

    def test_analytics(self):
        """Test analytics endpoint"""
        success, response = self.run_test(
            "Analytics - Get Stats",
            "GET",
            "tasks/analytics",
            200
        )
        
        if success:
            # Verify analytics structure
            required_fields = ['total', 'todo', 'in_progress', 'done', 'low', 'medium', 'high', 'completion_percentage']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Analytics - Structure Check", False, f"Missing fields: {missing_fields}")
                return False
            else:
                self.log_test("Analytics - Structure Check", True)
        
        return success

    def test_invalid_auth(self):
        """Test invalid authentication"""
        # Save current token
        original_token = self.token
        self.token = "invalid_token"
        
        success, _ = self.run_test(
            "Auth - Invalid Token",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

def main():
    print("🚀 Starting Task Manager API Tests")
    print("=" * 50)
    
    tester = TaskManagerAPITester()
    
    # Test authentication
    print("\n📝 Testing Authentication...")
    if not tester.test_auth_login():
        print("❌ Login failed, trying signup...")
        signup_success, test_user = tester.test_auth_signup()
        if not signup_success:
            print("❌ Both login and signup failed, stopping tests")
            return 1
    
    # Test auth/me endpoint
    tester.test_auth_me()
    
    # Test invalid auth
    tester.test_invalid_auth()
    
    # Test task operations
    print("\n📋 Testing Task Operations...")
    task_id = tester.test_tasks_create()
    
    # Test task listing
    tester.test_tasks_list()
    tester.test_tasks_list_with_filters()
    
    # Test task update and delete
    if task_id:
        tester.test_tasks_update(task_id)
        tester.test_tasks_delete(task_id)
    
    # Test analytics
    print("\n📊 Testing Analytics...")
    tester.test_analytics()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())