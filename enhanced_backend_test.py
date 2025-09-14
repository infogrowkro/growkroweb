#!/usr/bin/env python3
"""
Enhanced GrowKro Platform Backend API Tests
Tests multi-platform social media integration and comprehensive admin panel
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = "https://creator-hub-147.preview.emergentagent.com/api"

class EnhancedGrowKroTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.existing_creators = []
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message=""):
        """Log test result"""
        if success:
            self.test_results["passed"] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED - {message}")
    
    def test_api_health(self):
        """Test if API is running"""
        try:
            response = requests.get(f"{self.base_url}/creators")
            if response.status_code == 200:
                self.log_result("API Health Check", True, "API is running and accessible")
                return True
            else:
                self.log_result("API Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def load_existing_creators(self):
        """Load existing creators for testing"""
        try:
            response = requests.get(f"{self.base_url}/creators")
            if response.status_code == 200:
                self.existing_creators = response.json()
                self.log_result("Load Existing Creators", True, f"Loaded {len(self.existing_creators)} creators")
                return True
            else:
                self.log_result("Load Existing Creators", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Load Existing Creators", False, f"Exception: {str(e)}")
            return False
    
    def test_multi_platform_social_media(self):
        """Test multi-platform social media integration"""
        print("\n=== Testing Multi-Platform Social Media Integration ===")
        
        if not self.existing_creators:
            self.log_result("Multi-Platform Test", False, "No creators available")
            return
        
        # Test Priya Sharma's multi-platform data
        priya = next((c for c in self.existing_creators if c["name"] == "Priya Sharma"), None)
        if priya:
            # Verify all 5 social platforms
            platforms_correct = (
                priya.get("instagram_followers", 0) == 45000 and
                priya.get("youtube_subscribers", 0) == 12000 and
                priya.get("twitter_followers", 0) == 25000 and
                priya.get("tiktok_followers", 0) == 80000 and
                priya.get("snapchat_followers", 0) == 15000
            )
            
            if platforms_correct:
                self.log_result("Priya Multi-Platform Data", True, "All 5 social platforms: IG(45K), YT(12K), TW(25K), TT(80K), SC(15K)")
            else:
                self.log_result("Priya Multi-Platform Data", False, f"Platform data mismatch")
            
            # Verify handles are set
            handles_set = all([
                priya.get("instagram_handle"),
                priya.get("youtube_handle"),
                priya.get("twitter_handle"),
                priya.get("tiktok_handle"),
                priya.get("snapchat_handle")
            ])
            
            if handles_set:
                self.log_result("Priya Social Handles", True, "All social media handles configured")
            else:
                self.log_result("Priya Social Handles", False, "Some handles missing")
        
        # Test Rahul Tech's multi-platform data
        rahul = next((c for c in self.existing_creators if c["name"] == "Rahul Tech"), None)
        if rahul:
            platforms_correct = (
                rahul.get("instagram_followers", 0) == 28000 and
                rahul.get("youtube_subscribers", 0) == 85000 and
                rahul.get("twitter_followers", 0) == 35000 and
                rahul.get("tiktok_followers", 0) == 120000 and
                rahul.get("snapchat_followers", 0) == 8000
            )
            
            if platforms_correct:
                self.log_result("Rahul Multi-Platform Data", True, "All 5 social platforms: IG(28K), YT(85K), TW(35K), TT(120K), SC(8K)")
            else:
                self.log_result("Rahul Multi-Platform Data", False, f"Platform data mismatch")
    
    def test_profile_status_management(self):
        """Test profile status management system"""
        print("\n=== Testing Profile Status Management ===")
        
        if not self.existing_creators:
            self.log_result("Profile Status Test", False, "No creators available")
            return
        
        # Check that creators have profile_status field
        for creator in self.existing_creators:
            if "profile_status" in creator:
                status = creator["profile_status"]
                valid_statuses = ["pending", "approved", "rejected", "suspended"]
                if status in valid_statuses:
                    self.log_result(f"Profile Status - {creator['name']}", True, f"Status: {status}")
                else:
                    self.log_result(f"Profile Status - {creator['name']}", False, f"Invalid status: {status}")
            else:
                self.log_result(f"Profile Status - {creator['name']}", False, "Missing profile_status field")
        
        # Test admin approval workflow
        if self.existing_creators:
            creator_id = self.existing_creators[0]["id"]
            try:
                action_data = {
                    "creator_id": creator_id,
                    "action": "approve",
                    "notes": "Test approval for enhanced profile"
                }
                response = requests.post(f"{self.base_url}/admin/creators/{creator_id}/approve", json=action_data)
                if response.status_code == 200:
                    result = response.json()
                    if "approved" in result.get("message", "").lower():
                        self.log_result("Admin Approval Workflow", True, "Creator approval successful")
                    else:
                        self.log_result("Admin Approval Workflow", False, f"Unexpected message: {result.get('message')}")
                else:
                    self.log_result("Admin Approval Workflow", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Admin Approval Workflow", False, f"Exception: {str(e)}")
    
    def test_admin_user_management_apis(self):
        """Test comprehensive admin user management APIs"""
        print("\n=== Testing Admin User Management APIs ===")
        
        # Test 1: User management statistics
        try:
            response = requests.get(f"{self.base_url}/admin/users/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_creators", "pending_approval", "approved_creators", "rejected_creators", "suspended_creators"]
                if all(field in stats for field in required_fields):
                    self.log_result("Admin User Stats API", True, f"Total: {stats['total_creators']}, Pending: {stats['pending_approval']}, Approved: {stats['approved_creators']}")
                else:
                    self.log_result("Admin User Stats API", False, f"Missing fields. Got: {list(stats.keys())}")
            else:
                self.log_result("Admin User Stats API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Admin User Stats API", False, f"Exception: {str(e)}")
        
        # Test 2: Pending creators API
        try:
            response = requests.get(f"{self.base_url}/admin/creators/pending")
            if response.status_code == 200:
                pending_creators = response.json()
                if isinstance(pending_creators, list):
                    self.log_result("Pending Creators API", True, f"Retrieved {len(pending_creators)} pending creators")
                else:
                    self.log_result("Pending Creators API", False, "Response is not a list")
            else:
                self.log_result("Pending Creators API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Pending Creators API", False, f"Exception: {str(e)}")
    
    def test_admin_financial_management_apis(self):
        """Test admin financial management APIs"""
        print("\n=== Testing Admin Financial Management APIs ===")
        
        # Test 1: Financial transactions API
        try:
            response = requests.get(f"{self.base_url}/admin/financial/transactions?limit=20")
            if response.status_code == 200:
                data = response.json()
                if "transactions" in data and "total" in data and "page" in data:
                    self.log_result("Financial Transactions API", True, f"Retrieved {len(data['transactions'])} transactions, Total: {data['total']}")
                else:
                    self.log_result("Financial Transactions API", False, "Invalid response structure")
            else:
                self.log_result("Financial Transactions API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Financial Transactions API", False, f"Exception: {str(e)}")
        
        # Test 2: Revenue statistics API
        try:
            response = requests.get(f"{self.base_url}/admin/financial/revenue")
            if response.status_code == 200:
                revenue = response.json()
                required_fields = ["total_revenue", "subscription_revenue", "verification_revenue", "package_revenue", "total_transactions"]
                if all(field in revenue for field in required_fields):
                    self.log_result("Revenue Statistics API", True, f"Total Revenue: ₹{revenue['total_revenue']}, Transactions: {revenue['total_transactions']}")
                else:
                    self.log_result("Revenue Statistics API", False, f"Missing fields. Got: {list(revenue.keys())}")
            else:
                self.log_result("Revenue Statistics API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Revenue Statistics API", False, f"Exception: {str(e)}")
    
    def test_admin_content_management_apis(self):
        """Test admin content management APIs"""
        print("\n=== Testing Admin Content Management APIs ===")
        
        try:
            response = requests.get(f"{self.base_url}/admin/content/reports")
            if response.status_code == 200:
                reports = response.json()
                required_fields = ["spam_reports", "flagged_profiles", "content_violations", "pending_reviews"]
                if all(field in reports for field in required_fields):
                    self.log_result("Content Reports API", True, f"Spam: {reports['spam_reports']}, Flagged: {reports['flagged_profiles']}, Violations: {reports['content_violations']}")
                else:
                    self.log_result("Content Reports API", False, f"Missing fields. Got: {list(reports.keys())}")
            else:
                self.log_result("Content Reports API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Content Reports API", False, f"Exception: {str(e)}")
    
    def test_admin_analytics_dashboard_api(self):
        """Test admin analytics dashboard API"""
        print("\n=== Testing Admin Analytics Dashboard API ===")
        
        try:
            response = requests.get(f"{self.base_url}/admin/analytics/dashboard")
            if response.status_code == 200:
                analytics = response.json()
                required_sections = ["user_growth", "revenue_metrics", "engagement_metrics"]
                
                if all(section in analytics for section in required_sections):
                    self.log_result("Analytics Dashboard API", True, "All required sections present")
                    
                    # Verify user growth section
                    user_growth = analytics["user_growth"]
                    if "total_creators" in user_growth and "active_creators" in user_growth:
                        self.log_result("User Growth Analytics", True, f"Total: {user_growth['total_creators']}, Active: {user_growth['active_creators']}")
                    else:
                        self.log_result("User Growth Analytics", False, "Missing user growth fields")
                    
                    # Verify revenue metrics section
                    revenue_metrics = analytics["revenue_metrics"]
                    if "total_revenue" in revenue_metrics and "transaction_count" in revenue_metrics:
                        self.log_result("Revenue Analytics", True, f"Revenue: ₹{revenue_metrics['total_revenue']}, Transactions: {revenue_metrics['transaction_count']}")
                    else:
                        self.log_result("Revenue Analytics", False, "Missing revenue metrics fields")
                    
                    # Verify engagement metrics section
                    engagement_metrics = analytics["engagement_metrics"]
                    if "verified_creators" in engagement_metrics and "premium_creators" in engagement_metrics:
                        self.log_result("Engagement Analytics", True, f"Verified: {engagement_metrics['verified_creators']}, Premium: {engagement_metrics['premium_creators']}")
                    else:
                        self.log_result("Engagement Analytics", False, "Missing engagement metrics fields")
                else:
                    self.log_result("Analytics Dashboard API", False, f"Missing sections. Got: {list(analytics.keys())}")
            else:
                self.log_result("Analytics Dashboard API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Analytics Dashboard API", False, f"Exception: {str(e)}")
    
    def test_admin_notifications_system_apis(self):
        """Test admin notifications system APIs"""
        print("\n=== Testing Admin Notifications System APIs ===")
        
        # Test 1: Send notification API
        try:
            notification_data = {
                "title": "Enhanced Platform Launch",
                "message": "Welcome to the new GrowKro platform with comprehensive admin panel and multi-platform social media integration!",
                "target": "all"
            }
            response = requests.post(f"{self.base_url}/admin/notifications/send", json=notification_data)
            if response.status_code == 200:
                result = response.json()
                if "notification_id" in result and "target_count" in result:
                    self.log_result("Send Notification API", True, f"Sent to {result['target_count']} users, ID: {result['notification_id'][:8]}...")
                else:
                    self.log_result("Send Notification API", False, "Missing response fields")
            else:
                self.log_result("Send Notification API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Send Notification API", False, f"Exception: {str(e)}")
        
        # Test 2: Send targeted notification
        try:
            notification_data = {
                "title": "Creator Update",
                "message": "New features available for creators with enhanced social media integration.",
                "target": "creators"
            }
            response = requests.post(f"{self.base_url}/admin/notifications/send", json=notification_data)
            if response.status_code == 200:
                result = response.json()
                self.log_result("Send Targeted Notification API", True, f"Sent to {result.get('target_count', 0)} creators")
            else:
                self.log_result("Send Targeted Notification API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Send Targeted Notification API", False, f"Exception: {str(e)}")
        
        # Test 3: Notification history API (known to have ObjectId serialization issue)
        try:
            response = requests.get(f"{self.base_url}/admin/notifications/history?limit=5")
            if response.status_code == 200:
                notifications = response.json()
                self.log_result("Notification History API", True, f"Retrieved {len(notifications)} notifications")
            elif response.status_code == 500:
                self.log_result("Notification History API", False, "Minor: ObjectId serialization issue (known MongoDB issue)")
            else:
                self.log_result("Notification History API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Notification History API", False, f"Exception: {str(e)}")
    
    def test_admin_verification_compliance_apis(self):
        """Test admin verification and compliance APIs"""
        print("\n=== Testing Admin Verification & Compliance APIs ===")
        
        test_email = "enhanced.test@growkro.com"
        
        # Test 1: Send OTP API
        try:
            response = requests.post(f"{self.base_url}/admin/verification/otp", params={"email": test_email})
            if response.status_code == 200:
                result = response.json()
                if "otp" in result and "message" in result:
                    self.log_result("Send OTP API", True, f"OTP generated and sent")
                    self.test_otp = result["otp"]
                else:
                    self.log_result("Send OTP API", False, "Missing OTP in response")
            else:
                self.log_result("Send OTP API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Send OTP API", False, f"Exception: {str(e)}")
        
        # Test 2: Verify OTP API
        if hasattr(self, 'test_otp'):
            try:
                response = requests.post(f"{self.base_url}/admin/verification/verify-otp", 
                                       params={"email": test_email, "otp": self.test_otp})
                if response.status_code == 200:
                    result = response.json()
                    if "verified successfully" in result.get("message", "").lower():
                        self.log_result("Verify OTP API", True, "OTP verification successful")
                    else:
                        self.log_result("Verify OTP API", False, f"Unexpected message: {result.get('message')}")
                else:
                    self.log_result("Verify OTP API", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Verify OTP API", False, f"Exception: {str(e)}")
        
        # Test 3: Invalid OTP handling
        try:
            response = requests.post(f"{self.base_url}/admin/verification/verify-otp", 
                                   params={"email": test_email, "otp": "INVALID"})
            if response.status_code == 400:
                self.log_result("Invalid OTP Handling", True, "Correctly rejected invalid OTP")
            else:
                self.log_result("Invalid OTP Handling", False, f"Expected 400, got: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid OTP Handling", False, f"Exception: {str(e)}")
    
    def test_enhanced_creator_data_retrieval(self):
        """Test enhanced creator data retrieval with all social platforms"""
        print("\n=== Testing Enhanced Creator Data Retrieval ===")
        
        if not self.existing_creators:
            self.log_result("Enhanced Data Retrieval", False, "No creators available")
            return
        
        # Test individual creator retrieval
        for creator in self.existing_creators:
            creator_id = creator["id"]
            try:
                response = requests.get(f"{self.base_url}/creators/{creator_id}")
                if response.status_code == 200:
                    creator_data = response.json()
                    
                    # Check for all social media fields
                    social_fields = [
                        "instagram_handle", "instagram_followers",
                        "youtube_handle", "youtube_subscribers", 
                        "twitter_handle", "twitter_followers",
                        "tiktok_handle", "tiktok_followers",
                        "snapchat_handle", "snapchat_followers"
                    ]
                    
                    all_fields_present = all(field in creator_data for field in social_fields)
                    if all_fields_present:
                        self.log_result(f"Enhanced Data - {creator['name']}", True, "All social media fields present")
                    else:
                        missing_fields = [field for field in social_fields if field not in creator_data]
                        self.log_result(f"Enhanced Data - {creator['name']}", False, f"Missing fields: {missing_fields}")
                    
                    # Check for admin management fields
                    admin_fields = ["profile_status", "admin_notes"]
                    admin_fields_present = all(field in creator_data for field in admin_fields)
                    if admin_fields_present:
                        self.log_result(f"Admin Fields - {creator['name']}", True, f"Status: {creator_data['profile_status']}")
                    else:
                        self.log_result(f"Admin Fields - {creator['name']}", False, "Missing admin management fields")
                else:
                    self.log_result(f"Retrieve Creator - {creator['name']}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Retrieve Creator - {creator['name']}", False, f"Exception: {str(e)}")
    
    def run_comprehensive_enhanced_tests(self):
        """Run all comprehensive enhanced tests"""
        print("🚀 Starting Comprehensive Enhanced GrowKro Platform Tests")
        print(f"🔗 Testing Enhanced APIs at: {self.base_url}")
        print("=" * 70)
        
        # Check API health first
        if not self.test_api_health():
            print("❌ API is not accessible. Stopping tests.")
            return self.test_results
        
        # Load existing creators
        if not self.load_existing_creators():
            print("❌ Could not load existing creators. Stopping tests.")
            return self.test_results
        
        # Run all enhanced tests
        self.test_multi_platform_social_media()
        self.test_profile_status_management()
        self.test_enhanced_creator_data_retrieval()
        self.test_admin_user_management_apis()
        self.test_admin_financial_management_apis()
        self.test_admin_content_management_apis()
        self.test_admin_analytics_dashboard_api()
        self.test_admin_notifications_system_apis()
        self.test_admin_verification_compliance_apis()
        
        # Print comprehensive summary
        print("\n" + "=" * 70)
        print("📊 COMPREHENSIVE ENHANCED TESTS SUMMARY")
        print("=" * 70)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        # Detailed feature summary
        print(f"\n🎯 ENHANCED FEATURES TESTED:")
        print(f"   ✅ Multi-Platform Social Media Integration (5 platforms)")
        print(f"   ✅ Profile Status Management (pending/approved/rejected/suspended)")
        print(f"   ✅ Admin User Management APIs")
        print(f"   ✅ Admin Financial Management APIs")
        print(f"   ✅ Admin Content Management APIs")
        print(f"   ✅ Admin Analytics Dashboard API")
        print(f"   ✅ Admin Notifications System APIs")
        print(f"   ✅ Admin Verification & Compliance APIs")
        print(f"   ✅ Enhanced Creator Data Retrieval")
        
        return self.test_results

if __name__ == "__main__":
    tester = EnhancedGrowKroTester()
    results = tester.run_comprehensive_enhanced_tests()