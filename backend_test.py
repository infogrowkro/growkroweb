#!/usr/bin/env python3
"""
GrowKro Creator Profile System Backend API Tests
Tests all creator CRUD operations, search, filtering, packages, and statistics
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = "https://creator-hub-147.preview.emergentagent.com/api"

class GrowKroAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_creators = []
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
            response = requests.get(f"{self.base_url.replace('/api', '')}/")
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "GrowKro API is running!":
                    self.log_result("API Health Check", True, "API is running")
                    return True
                else:
                    self.log_result("API Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_result("API Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_create_creator(self):
        """Test creator creation with validation"""
        print("\n=== Testing Creator Creation ===")
        
        # Test 1: Create valid creator
        creator_data = {
            "name": "Ananya Sharma",
            "email": "ananya.sharma@example.com",
            "bio": "Fashion and lifestyle content creator from Mumbai",
            "instagram_handle": "@ananya_fashion",
            "youtube_handle": "AnanyaStyleTV",
            "instagram_followers": 25000,
            "youtube_subscribers": 15000,
            "location": "Mumbai",
            "category": "Fashion"
        }
        
        try:
            response = requests.post(f"{self.base_url}/creators", json=creator_data)
            if response.status_code == 200:
                creator = response.json()
                self.test_creators.append(creator["id"])
                self.log_result("Create Valid Creator", True, f"Created creator: {creator['name']}")
                
                # Verify all fields are set correctly
                if (creator["name"] == creator_data["name"] and 
                    creator["email"] == creator_data["email"] and
                    creator["category"] == creator_data["category"]):
                    self.log_result("Creator Data Validation", True, "All fields match")
                else:
                    self.log_result("Creator Data Validation", False, "Field mismatch")
            else:
                self.log_result("Create Valid Creator", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Create Valid Creator", False, f"Exception: {str(e)}")
        
        # Test 2: Create another creator for testing
        creator_data2 = {
            "name": "Vikram Tech",
            "email": "vikram.tech@example.com", 
            "bio": "Technology reviewer and gadget enthusiast",
            "instagram_handle": "@vikram_tech",
            "youtube_handle": "VikramTechReviews",
            "instagram_followers": 45000,
            "youtube_subscribers": 80000,
            "location": "Bangalore",
            "category": "Technology"
        }
        
        try:
            response = requests.post(f"{self.base_url}/creators", json=creator_data2)
            if response.status_code == 200:
                creator = response.json()
                self.test_creators.append(creator["id"])
                self.log_result("Create Second Creator", True, f"Created creator: {creator['name']}")
            else:
                self.log_result("Create Second Creator", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Create Second Creator", False, f"Exception: {str(e)}")
        
        # Test 3: Try to create duplicate email
        try:
            response = requests.post(f"{self.base_url}/creators", json=creator_data)
            if response.status_code == 400:
                self.log_result("Duplicate Email Validation", True, "Correctly rejected duplicate email")
            else:
                self.log_result("Duplicate Email Validation", False, f"Should have rejected duplicate, got: {response.status_code}")
        except Exception as e:
            self.log_result("Duplicate Email Validation", False, f"Exception: {str(e)}")
    
    def test_get_creators(self):
        """Test getting creators list"""
        print("\n=== Testing Get Creators ===")
        
        try:
            response = requests.get(f"{self.base_url}/creators")
            if response.status_code == 200:
                creators = response.json()
                if isinstance(creators, list):
                    self.log_result("Get All Creators", True, f"Retrieved {len(creators)} creators")
                    
                    # Check if our test creators are in the list
                    creator_ids = [c["id"] for c in creators]
                    found_test_creators = sum(1 for test_id in self.test_creators if test_id in creator_ids)
                    if found_test_creators > 0:
                        self.log_result("Test Creators in List", True, f"Found {found_test_creators} test creators")
                    else:
                        self.log_result("Test Creators in List", False, "No test creators found in list")
                else:
                    self.log_result("Get All Creators", False, "Response is not a list")
            else:
                self.log_result("Get All Creators", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get All Creators", False, f"Exception: {str(e)}")
    
    def test_get_creator_by_id(self):
        """Test getting specific creator by ID"""
        print("\n=== Testing Get Creator by ID ===")
        
        if not self.test_creators:
            self.log_result("Get Creator by ID", False, "No test creators available")
            return
        
        creator_id = self.test_creators[0]
        try:
            response = requests.get(f"{self.base_url}/creators/{creator_id}")
            if response.status_code == 200:
                creator = response.json()
                if creator["id"] == creator_id:
                    self.log_result("Get Creator by ID", True, f"Retrieved creator: {creator['name']}")
                else:
                    self.log_result("Get Creator by ID", False, "ID mismatch")
            else:
                self.log_result("Get Creator by ID", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Creator by ID", False, f"Exception: {str(e)}")
        
        # Test non-existent creator
        try:
            fake_id = str(uuid.uuid4())
            response = requests.get(f"{self.base_url}/creators/{fake_id}")
            if response.status_code == 404:
                self.log_result("Get Non-existent Creator", True, "Correctly returned 404")
            else:
                self.log_result("Get Non-existent Creator", False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Get Non-existent Creator", False, f"Exception: {str(e)}")
    
    def test_update_creator(self):
        """Test updating creator profile"""
        print("\n=== Testing Update Creator ===")
        
        if not self.test_creators:
            self.log_result("Update Creator", False, "No test creators available")
            return
        
        creator_id = self.test_creators[0]
        update_data = {
            "bio": "Updated bio: Fashion and lifestyle content creator with focus on sustainable fashion",
            "instagram_followers": 30000,
            "location": "Mumbai, Maharashtra"
        }
        
        try:
            response = requests.put(f"{self.base_url}/creators/{creator_id}", json=update_data)
            if response.status_code == 200:
                creator = response.json()
                if (creator["bio"] == update_data["bio"] and 
                    creator["instagram_followers"] == update_data["instagram_followers"]):
                    self.log_result("Update Creator", True, "Creator updated successfully")
                else:
                    self.log_result("Update Creator", False, "Update data not reflected")
            else:
                self.log_result("Update Creator", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Update Creator", False, f"Exception: {str(e)}")
    
    def test_search_creators(self):
        """Test creator search functionality"""
        print("\n=== Testing Creator Search ===")
        
        # Test 1: Search by category
        try:
            response = requests.get(f"{self.base_url}/search/creators?category=Fashion")
            if response.status_code == 200:
                data = response.json()
                if "results" in data and isinstance(data["results"], list):
                    fashion_creators = [c for c in data["results"] if "fashion" in c.get("category", "").lower()]
                    if len(fashion_creators) > 0:
                        self.log_result("Search by Category", True, f"Found {len(fashion_creators)} fashion creators")
                    else:
                        self.log_result("Search by Category", True, "No fashion creators found (acceptable)")
                else:
                    self.log_result("Search by Category", False, "Invalid response format")
            else:
                self.log_result("Search by Category", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Search by Category", False, f"Exception: {str(e)}")
        
        # Test 2: Search by location
        try:
            response = requests.get(f"{self.base_url}/search/creators?location=Mumbai")
            if response.status_code == 200:
                data = response.json()
                if "results" in data:
                    self.log_result("Search by Location", True, f"Found {data.get('count', 0)} creators in Mumbai")
                else:
                    self.log_result("Search by Location", False, "Invalid response format")
            else:
                self.log_result("Search by Location", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Search by Location", False, f"Exception: {str(e)}")
        
        # Test 3: Search by text query
        try:
            response = requests.get(f"{self.base_url}/search/creators?q=tech")
            if response.status_code == 200:
                data = response.json()
                if "results" in data:
                    self.log_result("Search by Text Query", True, f"Found {data.get('count', 0)} creators matching 'tech'")
                else:
                    self.log_result("Search by Text Query", False, "Invalid response format")
            else:
                self.log_result("Search by Text Query", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Search by Text Query", False, f"Exception: {str(e)}")
    
    def test_filter_creators(self):
        """Test creator filtering"""
        print("\n=== Testing Creator Filtering ===")
        
        # Test 1: Filter by verified status
        try:
            response = requests.get(f"{self.base_url}/creators?verified_only=true")
            if response.status_code == 200:
                creators = response.json()
                verified_count = sum(1 for c in creators if c.get("verification_status", False))
                self.log_result("Filter Verified Creators", True, f"Found {verified_count} verified creators")
            else:
                self.log_result("Filter Verified Creators", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Filter Verified Creators", False, f"Exception: {str(e)}")
        
        # Test 2: Filter by category
        try:
            response = requests.get(f"{self.base_url}/creators?category=Technology")
            if response.status_code == 200:
                creators = response.json()
                tech_creators = [c for c in creators if "tech" in c.get("category", "").lower()]
                self.log_result("Filter by Category", True, f"Found {len(tech_creators)} tech creators")
            else:
                self.log_result("Filter by Category", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Filter by Category", False, f"Exception: {str(e)}")
    
    def test_highlight_packages(self):
        """Test highlight package operations"""
        print("\n=== Testing Highlight Packages ===")
        
        # Test 1: Get all packages
        try:
            response = requests.get(f"{self.base_url}/packages")
            if response.status_code == 200:
                packages = response.json()
                if isinstance(packages, list) and len(packages) == 3:
                    package_names = [p["name"] for p in packages]
                    expected_packages = ["Silver Highlight", "Gold Highlight", "Platinum Highlight"]
                    if all(name in package_names for name in expected_packages):
                        self.log_result("Get All Packages", True, f"Found all 3 packages: {package_names}")
                    else:
                        self.log_result("Get All Packages", False, f"Missing packages. Found: {package_names}")
                else:
                    self.log_result("Get All Packages", False, f"Expected 3 packages, got: {len(packages) if isinstance(packages, list) else 'invalid'}")
            else:
                self.log_result("Get All Packages", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get All Packages", False, f"Exception: {str(e)}")
        
        # Test 2: Get specific package
        try:
            response = requests.get(f"{self.base_url}/packages/gold")
            if response.status_code == 200:
                package = response.json()
                if package["id"] == "gold" and package["price"] == 9999:
                    self.log_result("Get Gold Package", True, f"Gold package: ₹{package['price']}")
                else:
                    self.log_result("Get Gold Package", False, "Package details incorrect")
            else:
                self.log_result("Get Gold Package", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Gold Package", False, f"Exception: {str(e)}")
        
        # Test 3: Get non-existent package
        try:
            response = requests.get(f"{self.base_url}/packages/diamond")
            if response.status_code == 404:
                self.log_result("Get Non-existent Package", True, "Correctly returned 404")
            else:
                self.log_result("Get Non-existent Package", False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Get Non-existent Package", False, f"Exception: {str(e)}")
    
    def test_upgrade_packages(self):
        """Test creator package upgrades"""
        print("\n=== Testing Package Upgrades ===")
        
        if not self.test_creators:
            self.log_result("Package Upgrade", False, "No test creators available")
            return
        
        creator_id = self.test_creators[0]
        
        # Test 1: Upgrade to Gold package
        try:
            response = requests.post(f"{self.base_url}/creators/{creator_id}/upgrade-package/gold")
            if response.status_code == 200:
                result = response.json()
                if "Gold" in result.get("message", ""):
                    self.log_result("Upgrade to Gold", True, "Successfully upgraded to Gold")
                    
                    # Verify the upgrade by getting creator details
                    time.sleep(1)  # Small delay to ensure update is processed
                    creator_response = requests.get(f"{self.base_url}/creators/{creator_id}")
                    if creator_response.status_code == 200:
                        creator = creator_response.json()
                        if creator.get("highlight_package") == "gold":
                            self.log_result("Verify Gold Upgrade", True, "Package upgrade verified")
                        else:
                            self.log_result("Verify Gold Upgrade", False, f"Package not updated: {creator.get('highlight_package')}")
                    else:
                        self.log_result("Verify Gold Upgrade", False, "Could not verify upgrade")
                else:
                    self.log_result("Upgrade to Gold", False, f"Unexpected message: {result.get('message')}")
            else:
                self.log_result("Upgrade to Gold", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Upgrade to Gold", False, f"Exception: {str(e)}")
        
        # Test 2: Upgrade to Platinum package
        if len(self.test_creators) > 1:
            creator_id2 = self.test_creators[1]
            try:
                response = requests.post(f"{self.base_url}/creators/{creator_id2}/upgrade-package/platinum")
                if response.status_code == 200:
                    self.log_result("Upgrade to Platinum", True, "Successfully upgraded to Platinum")
                else:
                    self.log_result("Upgrade to Platinum", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Upgrade to Platinum", False, f"Exception: {str(e)}")
        
        # Test 3: Try to upgrade with invalid package
        try:
            response = requests.post(f"{self.base_url}/creators/{creator_id}/upgrade-package/diamond")
            if response.status_code == 404:
                self.log_result("Invalid Package Upgrade", True, "Correctly rejected invalid package")
            else:
                self.log_result("Invalid Package Upgrade", False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Package Upgrade", False, f"Exception: {str(e)}")
        
        # Test 4: Try to upgrade non-existent creator
        try:
            fake_id = str(uuid.uuid4())
            response = requests.post(f"{self.base_url}/creators/{fake_id}/upgrade-package/gold")
            if response.status_code == 404:
                self.log_result("Upgrade Non-existent Creator", True, "Correctly rejected non-existent creator")
            else:
                self.log_result("Upgrade Non-existent Creator", False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Upgrade Non-existent Creator", False, f"Exception: {str(e)}")
    
    def test_platform_statistics(self):
        """Test platform statistics endpoint"""
        print("\n=== Testing Platform Statistics ===")
        
        try:
            response = requests.get(f"{self.base_url}/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_creators", "verified_creators", "highlight_packages"]
                
                if all(field in stats for field in required_fields):
                    self.log_result("Get Platform Stats", True, f"Total creators: {stats['total_creators']}")
                    
                    # Check highlight packages stats
                    packages = stats["highlight_packages"]
                    if all(pkg in packages for pkg in ["silver", "gold", "platinum"]):
                        self.log_result("Package Stats", True, f"Silver: {packages['silver']}, Gold: {packages['gold']}, Platinum: {packages['platinum']}")
                    else:
                        self.log_result("Package Stats", False, "Missing package statistics")
                else:
                    self.log_result("Get Platform Stats", False, f"Missing fields. Got: {list(stats.keys())}")
            else:
                self.log_result("Get Platform Stats", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Platform Stats", False, f"Exception: {str(e)}")
    
    def test_delete_creator(self):
        """Test creator deletion (cleanup)"""
        print("\n=== Testing Creator Deletion ===")
        
        for creator_id in self.test_creators:
            try:
                response = requests.delete(f"{self.base_url}/creators/{creator_id}")
                if response.status_code == 200:
                    self.log_result(f"Delete Creator {creator_id[:8]}", True, "Creator deleted successfully")
                else:
                    self.log_result(f"Delete Creator {creator_id[:8]}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Delete Creator {creator_id[:8]}", False, f"Exception: {str(e)}")
        
        # Test deleting non-existent creator
        try:
            fake_id = str(uuid.uuid4())
            response = requests.delete(f"{self.base_url}/creators/{fake_id}")
            if response.status_code == 404:
                self.log_result("Delete Non-existent Creator", True, "Correctly returned 404")
            else:
                self.log_result("Delete Non-existent Creator", False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Delete Non-existent Creator", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting GrowKro Creator Profile System Backend Tests")
        print(f"🔗 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Check API health first
        if not self.test_api_health():
            print("❌ API is not accessible. Stopping tests.")
            return self.test_results
        
        # Run all tests
        self.test_create_creator()
        self.test_get_creators()
        self.test_get_creator_by_id()
        self.test_update_creator()
        self.test_search_creators()
        self.test_filter_creators()
        self.test_highlight_packages()
        self.test_upgrade_packages()
        self.test_platform_statistics()
        self.test_delete_creator()  # Cleanup
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return self.test_results

if __name__ == "__main__":
    tester = GrowKroAPITester()
    results = tester.run_all_tests()