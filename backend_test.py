#!/usr/bin/env python3
"""
Backend Test Suite for Admin Tab Management System
Tests all CRUD operations for program-tabs and stat-tabs with authentication
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"Testing backend at: {API_URL}")

class AdminTabTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_super_admin_exists(self):
        """Test if super admin exists"""
        try:
            response = self.session.get(f"{API_URL}/check-super-admin")
            if response.status_code == 200:
                data = response.json()
                if data.get("exists"):
                    self.log_result("Super Admin Exists", True, 
                                  f"Super admin found: {data.get('email')}")
                    return True
                else:
                    self.log_result("Super Admin Exists", False, 
                                  "Super admin not found in database")
                    return False
            else:
                self.log_result("Super Admin Exists", False, 
                              f"API error: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Super Admin Exists", False, f"Exception: {str(e)}")
            return False
    
    def get_jwt_token(self):
        """Get JWT token for super admin"""
        try:
            response = self.session.post(f"{API_URL}/test-jwt")
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                if token:
                    self.auth_token = token
                    self.session.headers.update({"Authorization": f"Bearer {token}"})
                    self.log_result("JWT Token Creation", True, 
                                  "Successfully created JWT token for super admin")
                    return True
                else:
                    self.log_result("JWT Token Creation", False, 
                                  "No access token in response")
                    return False
            else:
                self.log_result("JWT Token Creation", False, 
                              f"API error: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("JWT Token Creation", False, f"Exception: {str(e)}")
            return False
    
    def test_jwt_verification(self):
        """Test JWT token verification"""
        try:
            response = self.session.post(f"{API_URL}/test-jwt-verify")
            if response.status_code == 200:
                data = response.json()
                if data.get("token_valid"):
                    self.log_result("JWT Token Verification", True, 
                                  f"Token verified for user: {data.get('email')}")
                    return True
                else:
                    self.log_result("JWT Token Verification", False, 
                                  "Token validation failed")
                    return False
            else:
                self.log_result("JWT Token Verification", False, 
                              f"API error: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("JWT Token Verification", False, f"Exception: {str(e)}")
            return False
    
    def test_unauthorized_access(self):
        """Test that unauthorized users get 403 Forbidden"""
        # Temporarily remove auth header
        original_headers = self.session.headers.copy()
        if "Authorization" in self.session.headers:
            del self.session.headers["Authorization"]
        
        try:
            # Test program tabs endpoint without auth
            response = self.session.post(f"{API_URL}/admin/program-tabs", 
                                       json={"title": "Test", "description": "Test"})
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_result("Unauthorized Access Protection", True, 
                              f"Correctly blocked unauthorized access with {response.status_code}")
                success = True
            else:
                self.log_result("Unauthorized Access Protection", False, 
                              f"Expected 401/403, got {response.status_code}")
                success = False
        except Exception as e:
            self.log_result("Unauthorized Access Protection", False, f"Exception: {str(e)}")
            success = False
        finally:
            # Restore auth headers
            self.session.headers.update(original_headers)
        
        return success
    
    def test_get_program_tabs(self):
        """Test GET /api/admin/program-tabs"""
        try:
            response = self.session.get(f"{API_URL}/admin/program-tabs")
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Program Tabs", True, 
                              f"Retrieved {len(data)} program tabs")
                return True, data
            else:
                self.log_result("Get Program Tabs", False, 
                              f"API error: {response.status_code}")
                return False, None
        except Exception as e:
            self.log_result("Get Program Tabs", False, f"Exception: {str(e)}")
            return False, None
    
    def test_create_program_tab(self):
        """Test POST /api/admin/program-tabs with specific test scenario"""
        test_data = {
            "title": "Advanced Islamic Studies",
            "description": "Deep dive into advanced Islamic scholarship topics",
            "image": "https://images.unsplash.com/photo-1694758375810-2d7c7bc3e84e",
            "border_color_light": "#E0F7FA",
            "border_color_dark": "#4A90A4",
            "type": "informational"
        }
        
        try:
            response = self.session.post(f"{API_URL}/admin/program-tabs", json=test_data)
            if response.status_code == 200:
                data = response.json()
                tab = data.get("tab")
                if tab and tab.get("id"):
                    self.log_result("Create Program Tab", True, 
                                  f"Created program tab with ID: {tab.get('id')}")
                    return True, tab
                else:
                    self.log_result("Create Program Tab", False, 
                                  "No tab data or ID in response")
                    return False, None
            else:
                self.log_result("Create Program Tab", False, 
                              f"API error: {response.status_code}", response.text)
                return False, None
        except Exception as e:
            self.log_result("Create Program Tab", False, f"Exception: {str(e)}")
            return False, None
    
    def test_update_program_tab(self, tab_id):
        """Test PUT /api/admin/program-tabs/{id}"""
        update_data = {
            "title": "Advanced Islamic Studies - Updated",
            "description": "Updated description for advanced Islamic scholarship topics"
        }
        
        try:
            response = self.session.put(f"{API_URL}/admin/program-tabs/{tab_id}", 
                                      json=update_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == update_data["title"]:
                    self.log_result("Update Program Tab", True, 
                                  f"Successfully updated program tab {tab_id}")
                    return True, data
                else:
                    self.log_result("Update Program Tab", False, 
                                  "Update data not reflected in response")
                    return False, None
            else:
                self.log_result("Update Program Tab", False, 
                              f"API error: {response.status_code}", response.text)
                return False, None
        except Exception as e:
            self.log_result("Update Program Tab", False, f"Exception: {str(e)}")
            return False, None
    
    def test_delete_program_tab(self, tab_id):
        """Test DELETE /api/admin/program-tabs/{id}"""
        try:
            response = self.session.delete(f"{API_URL}/admin/program-tabs/{tab_id}")
            if response.status_code == 200:
                data = response.json()
                if "deleted successfully" in data.get("message", "").lower():
                    self.log_result("Delete Program Tab", True, 
                                  f"Successfully deleted program tab {tab_id}")
                    return True
                else:
                    self.log_result("Delete Program Tab", False, 
                                  "Unexpected response message")
                    return False
            else:
                self.log_result("Delete Program Tab", False, 
                              f"API error: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Delete Program Tab", False, f"Exception: {str(e)}")
            return False
    
    def test_get_stat_tabs(self):
        """Test GET /api/admin/stat-tabs"""
        try:
            response = self.session.get(f"{API_URL}/admin/stat-tabs")
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Stat Tabs", True, 
                              f"Retrieved {len(data)} stat tabs")
                return True, data
            else:
                self.log_result("Get Stat Tabs", False, 
                              f"API error: {response.status_code}")
                return False, None
        except Exception as e:
            self.log_result("Get Stat Tabs", False, f"Exception: {str(e)}")
            return False, None
    
    def test_create_stat_tab(self):
        """Test POST /api/admin/stat-tabs"""
        test_data = {
            "title": "Active Students",
            "value": "1,250+",
            "border_color_light": "#4A90A4",
            "border_color_dark": "#B8739B",
            "type": "informational"
        }
        
        try:
            response = self.session.post(f"{API_URL}/admin/stat-tabs", json=test_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("id"):
                    self.log_result("Create Stat Tab", True, 
                                  f"Created stat tab with ID: {data.get('id')}")
                    return True, data
                else:
                    self.log_result("Create Stat Tab", False, 
                                  "No ID in response")
                    return False, None
            else:
                self.log_result("Create Stat Tab", False, 
                              f"API error: {response.status_code}", response.text)
                return False, None
        except Exception as e:
            self.log_result("Create Stat Tab", False, f"Exception: {str(e)}")
            return False, None
    
    def test_update_stat_tab(self, tab_id):
        """Test PUT /api/admin/stat-tabs/{id}"""
        update_data = {
            "title": "Active Students - Updated",
            "value": "1,500+"
        }
        
        try:
            response = self.session.put(f"{API_URL}/admin/stat-tabs/{tab_id}", 
                                      json=update_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == update_data["title"]:
                    self.log_result("Update Stat Tab", True, 
                                  f"Successfully updated stat tab {tab_id}")
                    return True, data
                else:
                    self.log_result("Update Stat Tab", False, 
                                  "Update data not reflected in response")
                    return False, None
            else:
                self.log_result("Update Stat Tab", False, 
                              f"API error: {response.status_code}", response.text)
                return False, None
        except Exception as e:
            self.log_result("Update Stat Tab", False, f"Exception: {str(e)}")
            return False, None
    
    def test_delete_stat_tab(self, tab_id):
        """Test DELETE /api/admin/stat-tabs/{id}"""
        try:
            response = self.session.delete(f"{API_URL}/admin/stat-tabs/{tab_id}")
            if response.status_code == 200:
                data = response.json()
                if "deleted successfully" in data.get("message", "").lower():
                    self.log_result("Delete Stat Tab", True, 
                                  f"Successfully deleted stat tab {tab_id}")
                    return True
                else:
                    self.log_result("Delete Stat Tab", False, 
                                  "Unexpected response message")
                    return False
            else:
                self.log_result("Delete Stat Tab", False, 
                              f"API error: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Delete Stat Tab", False, f"Exception: {str(e)}")
            return False
    
    def test_data_validation(self):
        """Test data validation for required fields"""
        # Test missing required fields for program tab
        try:
            response = self.session.post(f"{API_URL}/admin/program-tabs", json={})
            if response.status_code == 422 or response.status_code == 400:
                self.log_result("Data Validation - Missing Fields", True, 
                              "Correctly rejected request with missing required fields")
            else:
                self.log_result("Data Validation - Missing Fields", False, 
                              f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_result("Data Validation - Missing Fields", False, f"Exception: {str(e)}")
        
        # Test invalid data types
        try:
            invalid_data = {
                "title": 123,  # Should be string
                "description": None,  # Should be string
                "type": "invalid_type"
            }
            response = self.session.post(f"{API_URL}/admin/program-tabs", json=invalid_data)
            if response.status_code == 422 or response.status_code == 400:
                self.log_result("Data Validation - Invalid Types", True, 
                              "Correctly rejected request with invalid data types")
            else:
                self.log_result("Data Validation - Invalid Types", False, 
                              f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_result("Data Validation - Invalid Types", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all admin tab management tests"""
        print("=" * 60)
        print("ADMIN TAB MANAGEMENT SYSTEM - BACKEND TESTING")
        print("=" * 60)
        
        # Authentication tests
        if not self.test_super_admin_exists():
            print("CRITICAL: Super admin not found. Cannot proceed with tests.")
            return False
        
        if not self.get_jwt_token():
            print("CRITICAL: Cannot get JWT token. Cannot proceed with tests.")
            return False
        
        if not self.test_jwt_verification():
            print("CRITICAL: JWT token verification failed. Cannot proceed with tests.")
            return False
        
        # Test unauthorized access protection
        self.test_unauthorized_access()
        
        # Program Tab CRUD Tests
        print("\n--- PROGRAM TAB CRUD TESTS ---")
        
        # Get existing program tabs
        success, existing_tabs = self.test_get_program_tabs()
        
        # Create new program tab
        success, created_tab = self.test_create_program_tab()
        if success and created_tab:
            tab_id = created_tab.get("id")
            
            # Update the created tab
            self.test_update_program_tab(tab_id)
            
            # Delete the created tab
            self.test_delete_program_tab(tab_id)
        
        # Stat Tab CRUD Tests
        print("\n--- STAT TAB CRUD TESTS ---")
        
        # Get existing stat tabs
        success, existing_stat_tabs = self.test_get_stat_tabs()
        
        # Create new stat tab
        success, created_stat_tab = self.test_create_stat_tab()
        if success and created_stat_tab:
            stat_tab_id = created_stat_tab.get("id")
            
            # Update the created stat tab
            self.test_update_stat_tab(stat_tab_id)
            
            # Delete the created stat tab
            self.test_delete_stat_tab(stat_tab_id)
        
        # Data validation tests
        print("\n--- DATA VALIDATION TESTS ---")
        self.test_data_validation()
        
        # Print summary
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\nDETAILED RESULTS:")
        for result in self.test_results:
            print(f"  {result['status']}: {result['test']}")

def main():
    """Main test execution"""
    tester = AdminTabTester()
    success = tester.run_all_tests()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()