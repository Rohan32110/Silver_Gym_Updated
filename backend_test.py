
import requests
import sys
import time
import uuid
from datetime import datetime

class SilverGymAPITester:
    def __init__(self, base_url="https://9fa23f49-1892-4602-9826-8310f8d88fdd.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_username = f"test_user_{int(time.time())}"
        self.test_email = f"test{int(time.time())}@example.com"
        self.test_password = "TestPass123!"

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            print(f"Response status: {response.status_code}")
            try:
                response_data = response.json()
                print(f"Response data: {response_data}")
            except:
                response_data = {}
                print(f"Response text: {response.text}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")

            return success, response_data

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test the API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success and response.get("message") == "Silver Gym API is running"

    def test_user_signup(self):
        """Test user signup"""
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data={
                "username": self.test_username,
                "email": self.test_email,
                "password": self.test_password
            }
        )
        return success

    def test_user_login_before_approval(self):
        """Test user login before approval (should fail)"""
        success, response = self.run_test(
            "User Login Before Approval (Expected to fail)",
            "POST",
            "auth/login",
            403,  # Expecting 403 Forbidden
            data={
                "username": self.test_username,
                "password": self.test_password
            }
        )
        # This test passes if login fails with 403
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/admin/login",
            200,
            data={
                "username": "Silver Gym",
                "password": "silver101"
            }
        )
        if success and "access_token" in response:
            self.admin_token = response["access_token"]
            return True
        return False

    def test_get_all_users(self):
        """Test getting all users as admin"""
        success, response = self.run_test(
            "Get All Users",
            "GET",
            "admin/users",
            200,
            token=self.admin_token
        )
        if success and isinstance(response, list):
            # Find our test user
            for user in response:
                if user.get("username") == self.test_username:
                    self.test_user_id = user.get("id")
                    print(f"Found test user with ID: {self.test_user_id}")
                    break
            return True
        return False

    def test_approve_user(self):
        """Test approving a user"""
        if not self.test_user_id:
            print("❌ Cannot approve user - user ID not found")
            return False
            
        success, response = self.run_test(
            "Approve User",
            "PUT",
            f"admin/users/{self.test_user_id}",
            200,
            data={
                "status": "approved"
            },
            token=self.admin_token
        )
        return success

    def test_user_login_after_approval(self):
        """Test user login after approval"""
        success, response = self.run_test(
            "User Login After Approval",
            "POST",
            "auth/login",
            200,
            data={
                "username": self.test_username,
                "password": self.test_password
            }
        )
        if success and "access_token" in response:
            self.user_token = response["access_token"]
            return True
        return False

    def test_get_exercises(self):
        """Test getting exercises"""
        for level in ["beginner", "intermediate", "advanced"]:
            success, response = self.run_test(
                f"Get {level.capitalize()} Exercises",
                "GET",
                f"exercises/{level}",
                200,
                token=self.user_token
            )
            if not success or not isinstance(response, list) or len(response) == 0:
                return False
        return True

    def test_user_dashboard(self):
        """Test getting user dashboard"""
        success, response = self.run_test(
            "Get User Dashboard",
            "GET",
            "user/dashboard",
            200,
            token=self.user_token
        )
        return success and "total_stars" in response

    def test_complete_exercise(self):
        """Test completing an exercise"""
        # First get a beginner exercise
        success, exercises = self.run_test(
            "Get Beginner Exercises for Completion",
            "GET",
            "exercises/beginner",
            200,
            token=self.user_token
        )
        
        if not success or not exercises or len(exercises) == 0:
            return False
            
        exercise_id = exercises[0]["id"]
        
        success, response = self.run_test(
            "Complete Exercise",
            "POST",
            f"exercises/{exercise_id}/complete",
            200,
            token=self.user_token
        )
        return success and "stars_earned" in response

    def test_admin_stats(self):
        """Test getting admin stats"""
        success, response = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200,
            token=self.admin_token
        )
        return success and "total_users" in response

    def test_update_payment_status(self):
        """Test updating payment status"""
        if not self.test_user_id:
            print("❌ Cannot update payment status - user ID not found")
            return False
            
        success, response = self.run_test(
            "Update Payment Status",
            "PUT",
            f"admin/users/{self.test_user_id}",
            200,
            data={
                "payment_status": "paid"
            },
            token=self.admin_token
        )
        return success

    def test_reset_payments(self):
        """Test resetting all payments"""
        success, response = self.run_test(
            "Reset All Payments",
            "POST",
            "admin/reset-payments",
            200,
            token=self.admin_token
        )
        return success

    def test_clear_workout_data(self):
        """Test clearing all workout data"""
        success, response = self.run_test(
            "Clear All Workout Data",
            "POST",
            "admin/clear-workout-data",
            200,
            token=self.admin_token
        )
        return success

    def test_workout_data_cleared(self):
        """Test that workout data was actually cleared"""
        # First check user dashboard to verify stars are reset
        success, dashboard = self.run_test(
            "Check User Dashboard After Clear",
            "GET",
            "user/dashboard",
            200,
            token=self.user_token
        )
        
        if not success or dashboard.get("total_stars", -1) != 0:
            print(f"❌ User stars not reset to 0, current value: {dashboard.get('total_stars', 'unknown')}")
            return False
            
        print("✅ User stars successfully reset to 0")
        return True

    def test_delete_user(self):
        """Test deleting a user"""
        if not self.test_user_id:
            print("❌ Cannot delete user - user ID not found")
            return False
            
        success, response = self.run_test(
            "Delete User",
            "DELETE",
            f"admin/users/{self.test_user_id}",
            200,
            token=self.admin_token
        )
        return success

def main():
    tester = SilverGymAPITester()
    
    # Test API root
    if not tester.test_api_root():
        print("❌ API root test failed, stopping tests")
        return 1

    # Test user signup and authentication flow
    if not tester.test_user_signup():
        print("❌ User signup failed, stopping tests")
        return 1

    # Test login before approval (should fail)
    if not tester.test_user_login_before_approval():
        print("❌ User login before approval test failed, stopping tests")
        return 1

    # Test admin login
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1

    # Test getting all users
    if not tester.test_get_all_users():
        print("❌ Get all users failed, stopping tests")
        return 1

    # Test approving user
    if not tester.test_approve_user():
        print("❌ Approve user failed, stopping tests")
        return 1

    # Test user login after approval
    if not tester.test_user_login_after_approval():
        print("❌ User login after approval failed, stopping tests")
        return 1

    # Test getting exercises
    if not tester.test_get_exercises():
        print("❌ Get exercises failed, stopping tests")
        return 1

    # Test user dashboard
    if not tester.test_user_dashboard():
        print("❌ User dashboard failed, stopping tests")
        return 1

    # Test completing an exercise
    if not tester.test_complete_exercise():
        print("❌ Complete exercise failed, stopping tests")
        return 1

    # Test admin stats
    if not tester.test_admin_stats():
        print("❌ Admin stats failed, stopping tests")
        return 1

    # Test updating payment status
    if not tester.test_update_payment_status():
        print("❌ Update payment status failed, stopping tests")
        return 1

    # Test resetting payments
    if not tester.test_reset_payments():
        print("❌ Reset payments failed, stopping tests")
        return 1

    # Test clearing workout data (new feature)
    if not tester.test_clear_workout_data():
        print("❌ Clear workout data failed, stopping tests")
        return 1

    # Test that workout data was actually cleared
    if not tester.test_workout_data_cleared():
        print("❌ Workout data not properly cleared, stopping tests")
        return 1

    # Test deleting user
    if not tester.test_delete_user():
        print("❌ Delete user failed, stopping tests")
        return 1

    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
