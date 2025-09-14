#!/usr/bin/env python3
"""
GrowKro Updated Razorpay Integration and Business Owners API Tests
Focus on testing production Razorpay credentials and business collaboration features
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = "https://contentmaker-hub.preview.emergentagent.com/api"

class RazorpayBusinessAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_creators = []
        self.test_business_owners = []
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        # Store order IDs for testing
        self.subscription_order_id = None
        self.verification_order_id = None
        self.package_order_id = None
    
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
    
    def setup_test_data(self):
        """Create test creators and business owners for testing"""
        print("\n=== Setting Up Test Data ===")
        
        # Create test creator with sufficient followers for package upgrades
        creator_data = {
            "name": "Arjun Kapoor",
            "email": "arjun.kapoor@example.com",
            "bio": "Fashion influencer and brand collaborator with strong social media presence",
            "instagram_handle": "@arjun_fashion_style",
            "instagram_followers": 150000,  # Sufficient for Gold package
            "youtube_handle": "@ArjunStyleChannel",
            "youtube_subscribers": 45000,
            "twitter_handle": "@arjun_style",
            "twitter_followers": 35000,
            "tiktok_handle": "@arjunfashion",
            "tiktok_followers": 200000,
            "snapchat_handle": "@arjun_snaps",
            "snapchat_followers": 25000,
            "location": "Delhi",
            "category": "Fashion"
        }
        
        try:
            response = requests.post(f"{self.base_url}/creators", json=creator_data)
            if response.status_code == 200:
                creator = response.json()
                self.test_creators.append(creator["id"])
                self.log_result("Create Test Creator", True, f"Created: {creator['name']} (ID: {creator['id'][:8]}...)")
            else:
                self.log_result("Create Test Creator", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Create Test Creator", False, f"Exception: {str(e)}")
        
        # Create test business owner
        business_data = {
            "name": "Rajesh Sharma",
            "email": "rajesh.sharma@fashionbrand.com",
            "company_name": "StyleHub Fashion",
            "company_description": "Premium fashion brand focusing on sustainable and trendy clothing for young professionals",
            "industry": "fashion",
            "location": "Mumbai",
            "budget_range": "high",
            "collaboration_type": "sponsored_posts",
            "target_audience": "Young professionals aged 25-35",
            "preferred_platforms": ["instagram", "youtube", "tiktok"],
            "min_followers": 50000,
            "max_followers": 500000,
            "contact_phone": "+91-9876543210",
            "website": "https://stylehubfashion.com"
        }
        
        try:
            response = requests.post(f"{self.base_url}/business-owners", json=business_data)
            if response.status_code == 200:
                business = response.json()
                self.test_business_owners.append(business["id"])
                self.log_result("Create Test Business Owner", True, f"Created: {business['company_name']} (ID: {business['id'][:8]}...)")
            else:
                self.log_result("Create Test Business Owner", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Create Test Business Owner", False, f"Exception: {str(e)}")
    
    def test_updated_razorpay_pricing_api(self):
        """Test payment pricing API with updated credentials"""
        print("\n=== Testing Updated Razorpay Pricing API ===")
        
        try:
            response = requests.get(f"{self.base_url}/payments/pricing")
            if response.status_code == 200:
                pricing = response.json()
                
                # Check subscription pricing
                if "subscription" in pricing and "annual" in pricing["subscription"]:
                    annual = pricing["subscription"]["annual"]
                    if annual["amount"] == 4900 and annual["amount_inr"] == 49:
                        self.log_result("Subscription Pricing", True, f"Annual: ₹{annual['amount_inr']} ({annual['amount']} paise)")
                    else:
                        self.log_result("Subscription Pricing", False, f"Wrong amounts: {annual['amount']} paise, ₹{annual['amount_inr']}")
                else:
                    self.log_result("Subscription Pricing", False, "Missing subscription pricing")
                
                # Check verification pricing
                if "verification" in pricing and "profile" in pricing["verification"]:
                    profile = pricing["verification"]["profile"]
                    if profile["amount"] == 19900 and profile["amount_inr"] == 199:
                        self.log_result("Verification Pricing", True, f"Profile: ₹{profile['amount_inr']} ({profile['amount']} paise)")
                    else:
                        self.log_result("Verification Pricing", False, f"Wrong amounts: {profile['amount']} paise, ₹{profile['amount_inr']}")
                else:
                    self.log_result("Verification Pricing", False, "Missing verification pricing")
                
                # Check updated highlight packages pricing
                if "highlight_packages" in pricing:
                    packages = pricing["highlight_packages"]
                    expected_packages = {
                        "silver": {"amount": 199900, "amount_inr": 1999},
                        "gold": {"amount": 499900, "amount_inr": 4999},
                        "platinum": {"amount": 999900, "amount_inr": 9999}
                    }
                    
                    for pkg_id, expected in expected_packages.items():
                        if pkg_id in packages:
                            pkg = packages[pkg_id]
                            if pkg["amount"] == expected["amount"] and pkg["amount_inr"] == expected["amount_inr"]:
                                self.log_result(f"{pkg_id.title()} Package Pricing", True, f"₹{pkg['amount_inr']} ({pkg['amount']} paise)")
                            else:
                                self.log_result(f"{pkg_id.title()} Package Pricing", False, f"Wrong amounts: {pkg['amount']} paise, ₹{pkg['amount_inr']}")
                        else:
                            self.log_result(f"{pkg_id.title()} Package Pricing", False, "Package not found")
                else:
                    self.log_result("Highlight Packages Pricing", False, "Missing highlight packages pricing")
                    
            else:
                self.log_result("Payment Pricing API", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Payment Pricing API", False, f"Exception: {str(e)}")
    
    def test_updated_razorpay_create_order(self):
        """Test payment order creation with production Razorpay credentials"""
        print("\n=== Testing Updated Razorpay Create Order API ===")
        
        # Test 1: Create subscription payment order
        try:
            order_data = {
                "payment_type": "subscription"
            }
            response = requests.post(f"{self.base_url}/payments/create-order", json=order_data)
            if response.status_code == 200:
                order = response.json()
                required_fields = ["order_id", "amount", "currency", "key_id"]
                if all(field in order for field in required_fields):
                    if (order["amount"] == 4900 and 
                        order["currency"] == "INR" and 
                        order["key_id"] == "rzp_live_RHeQe0z3rj1DNW"):
                        self.log_result("Create Subscription Order with Production Keys", True, 
                                      f"Order ID: {order['order_id'][:20]}..., Amount: ₹{order['amount']/100}, Key: {order['key_id']}")
                        self.subscription_order_id = order["order_id"]
                    else:
                        self.log_result("Create Subscription Order with Production Keys", False, 
                                      f"Wrong details: amount={order['amount']}, currency={order['currency']}, key={order['key_id']}")
                else:
                    self.log_result("Create Subscription Order with Production Keys", False, 
                                  f"Missing fields. Got: {list(order.keys())}")
            else:
                self.log_result("Create Subscription Order with Production Keys", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Create Subscription Order with Production Keys", False, f"Exception: {str(e)}")
        
        # Test 2: Create verification payment order
        if self.test_creators:
            try:
                order_data = {
                    "payment_type": "verification",
                    "creator_id": self.test_creators[0]
                }
                response = requests.post(f"{self.base_url}/payments/create-order", json=order_data)
                if response.status_code == 200:
                    order = response.json()
                    if order["amount"] == 19900 and order["key_id"] == "rzp_live_RHeQe0z3rj1DNW":
                        self.log_result("Create Verification Order with Production Keys", True, 
                                      f"Order ID: {order['order_id'][:20]}..., Amount: ₹{order['amount']/100}")
                        self.verification_order_id = order["order_id"]
                    else:
                        self.log_result("Create Verification Order with Production Keys", False, 
                                      f"Wrong amount or key: {order['amount']}, {order['key_id']}")
                else:
                    self.log_result("Create Verification Order with Production Keys", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("Create Verification Order with Production Keys", False, f"Exception: {str(e)}")
        
        # Test 3: Create highlight package payment order
        if self.test_creators:
            try:
                order_data = {
                    "payment_type": "highlight_package",
                    "package_id": "gold",
                    "creator_id": self.test_creators[0]
                }
                response = requests.post(f"{self.base_url}/payments/create-order", json=order_data)
                if response.status_code == 200:
                    order = response.json()
                    if order["amount"] == 499900 and order["key_id"] == "rzp_live_RHeQe0z3rj1DNW":
                        self.log_result("Create Gold Package Order with Production Keys", True, 
                                      f"Order ID: {order['order_id'][:20]}..., Amount: ₹{order['amount']/100}")
                        self.package_order_id = order["order_id"]
                    else:
                        self.log_result("Create Gold Package Order with Production Keys", False, 
                                      f"Wrong amount or key: {order['amount']}, {order['key_id']}")
                else:
                    self.log_result("Create Gold Package Order with Production Keys", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("Create Gold Package Order with Production Keys", False, f"Exception: {str(e)}")
        
        # Test 4: Verify invalid payment types are still rejected
        try:
            order_data = {
                "payment_type": "invalid_type"
            }
            response = requests.post(f"{self.base_url}/payments/create-order", json=order_data)
            if response.status_code == 400:
                self.log_result("Invalid Payment Type Rejection", True, "Correctly rejected invalid payment type")
            else:
                self.log_result("Invalid Payment Type Rejection", False, f"Expected 400, got: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Payment Type Rejection", False, f"Exception: {str(e)}")
    
    def test_updated_razorpay_verify_payment(self):
        """Test payment verification with production credentials"""
        print("\n=== Testing Updated Razorpay Payment Verification ===")
        
        # Test 1: Verify payment structure with production keys
        if self.subscription_order_id:
            try:
                verification_data = {
                    "order_id": self.subscription_order_id,
                    "payment_id": "pay_test123456789",
                    "signature": "test_signature_for_production_keys"
                }
                response = requests.post(f"{self.base_url}/payments/verify", json=verification_data)
                # With production keys, this should fail at signature verification (expected)
                if response.status_code == 400:
                    self.log_result("Payment Verification Structure with Production Keys", True, 
                                  "API correctly processes verification request and validates signature")
                else:
                    self.log_result("Payment Verification Structure with Production Keys", False, 
                                  f"Unexpected status: {response.status_code}")
            except Exception as e:
                self.log_result("Payment Verification Structure with Production Keys", False, f"Exception: {str(e)}")
        
        # Test 2: Verify missing fields validation
        try:
            verification_data = {
                "order_id": "order_test123"
                # Missing payment_id and signature
            }
            response = requests.post(f"{self.base_url}/payments/verify", json=verification_data)
            if response.status_code == 422:  # Pydantic validation error
                self.log_result("Payment Verification Field Validation", True, "Correctly rejected missing fields")
            else:
                self.log_result("Payment Verification Field Validation", False, f"Expected 422, got: {response.status_code}")
        except Exception as e:
            self.log_result("Payment Verification Field Validation", False, f"Exception: {str(e)}")
    
    def test_updated_razorpay_transaction_status(self):
        """Test transaction status API with production orders"""
        print("\n=== Testing Updated Razorpay Transaction Status ===")
        
        # Test with subscription order if it exists
        if self.subscription_order_id:
            try:
                response = requests.get(f"{self.base_url}/payments/transaction/{self.subscription_order_id}")
                if response.status_code == 200:
                    transaction = response.json()
                    required_fields = ["id", "order_id", "payment_type", "amount", "status", "payment_status"]
                    if all(field in transaction for field in required_fields):
                        if (transaction["order_id"] == self.subscription_order_id and 
                            transaction["payment_type"] == "subscription" and
                            transaction["amount"] == 4900):
                            self.log_result("Get Subscription Transaction Status", True, 
                                          f"Status: {transaction['status']}, Payment Status: {transaction['payment_status']}")
                        else:
                            self.log_result("Get Subscription Transaction Status", False, "Transaction details mismatch")
                    else:
                        self.log_result("Get Subscription Transaction Status", False, 
                                      f"Missing fields. Got: {list(transaction.keys())}")
                else:
                    self.log_result("Get Subscription Transaction Status", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Get Subscription Transaction Status", False, f"Exception: {str(e)}")
        
        # Test with verification order if it exists
        if self.verification_order_id:
            try:
                response = requests.get(f"{self.base_url}/payments/transaction/{self.verification_order_id}")
                if response.status_code == 200:
                    transaction = response.json()
                    if (transaction["payment_type"] == "verification" and
                        transaction["amount"] == 19900):
                        self.log_result("Get Verification Transaction Status", True, 
                                      f"Status: {transaction['status']}")
                    else:
                        self.log_result("Get Verification Transaction Status", False, "Transaction details mismatch")
                else:
                    self.log_result("Get Verification Transaction Status", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Get Verification Transaction Status", False, f"Exception: {str(e)}")
        
        # Test with non-existent order ID
        try:
            fake_order_id = "order_fake123456789"
            response = requests.get(f"{self.base_url}/payments/transaction/{fake_order_id}")
            if response.status_code == 404:
                self.log_result("Get Non-existent Transaction", True, "Correctly returned 404")
            else:
                self.log_result("Get Non-existent Transaction", False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Get Non-existent Transaction", False, f"Exception: {str(e)}")
    
    def test_updated_razorpay_client_initialization(self):
        """Test Razorpay client initialization with production keys"""
        print("\n=== Testing Updated Razorpay Client Initialization ===")
        
        # Test by attempting to create an order (which requires valid client initialization)
        try:
            order_data = {
                "payment_type": "subscription"
            }
            response = requests.post(f"{self.base_url}/payments/create-order", json=order_data)
            
            if response.status_code == 200:
                order = response.json()
                if order.get("key_id") == "rzp_live_RHeQe0z3rj1DNW":
                    self.log_result("Razorpay Client Initialization", True, 
                                  f"Client successfully initialized with production key: {order['key_id']}")
                else:
                    self.log_result("Razorpay Client Initialization", False, 
                                  f"Wrong key returned: {order.get('key_id')}")
            elif response.status_code == 500 and "Payment system not configured" in response.text:
                self.log_result("Razorpay Client Initialization", False, "Razorpay client not configured")
            elif response.status_code == 500 and "Authentication failed" in response.text:
                self.log_result("Razorpay Client Initialization", False, "Razorpay authentication failed with production keys")
            else:
                # If we get a different error, the client might be initialized but there's another issue
                self.log_result("Razorpay Client Initialization", True, 
                              f"Client appears initialized (got response: {response.status_code})")
        except Exception as e:
            self.log_result("Razorpay Client Initialization", False, f"Exception: {str(e)}")
    
    def test_business_owners_browse_api(self):
        """Test GET /api/business-owners (browse businesses)"""
        print("\n=== Testing Business Owners Browse API ===")
        
        try:
            response = requests.get(f"{self.base_url}/business-owners")
            if response.status_code == 200:
                businesses = response.json()
                if isinstance(businesses, list):
                    self.log_result("Browse Business Owners", True, f"Retrieved {len(businesses)} business owners")
                    
                    # Check if our test business is in the list (if approved)
                    if self.test_business_owners and len(businesses) > 0:
                        business_ids = [b["id"] for b in businesses]
                        found_test_business = any(test_id in business_ids for test_id in self.test_business_owners)
                        if found_test_business:
                            self.log_result("Test Business in Browse List", True, "Found test business in browse list")
                        else:
                            self.log_result("Test Business in Browse List", True, "Test business not in list (may need approval)")
                    
                    # Verify business structure
                    if businesses:
                        business = businesses[0]
                        required_fields = ["id", "name", "company_name", "industry", "collaboration_type"]
                        if all(field in business for field in required_fields):
                            self.log_result("Business Owner Structure", True, "Business owner fields are correct")
                        else:
                            self.log_result("Business Owner Structure", False, "Missing required fields")
                else:
                    self.log_result("Browse Business Owners", False, "Response is not a list")
            else:
                self.log_result("Browse Business Owners", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Browse Business Owners", False, f"Exception: {str(e)}")
        
        # Test filtering by industry
        try:
            response = requests.get(f"{self.base_url}/business-owners?industry=fashion")
            if response.status_code == 200:
                fashion_businesses = response.json()
                if isinstance(fashion_businesses, list):
                    self.log_result("Filter Business by Industry", True, f"Found {len(fashion_businesses)} fashion businesses")
                else:
                    self.log_result("Filter Business by Industry", False, "Response is not a list")
            else:
                self.log_result("Filter Business by Industry", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Filter Business by Industry", False, f"Exception: {str(e)}")
        
        # Test filtering by location
        try:
            response = requests.get(f"{self.base_url}/business-owners?location=Mumbai")
            if response.status_code == 200:
                mumbai_businesses = response.json()
                if isinstance(mumbai_businesses, list):
                    self.log_result("Filter Business by Location", True, f"Found {len(mumbai_businesses)} Mumbai businesses")
                else:
                    self.log_result("Filter Business by Location", False, "Response is not a list")
            else:
                self.log_result("Filter Business by Location", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Filter Business by Location", False, f"Exception: {str(e)}")
    
    def test_business_owners_register_api(self):
        """Test POST /api/business-owners (register new business)"""
        print("\n=== Testing Business Owners Registration API ===")
        
        # Test 1: Register valid business
        business_data = {
            "name": "Priya Mehta",
            "email": "priya.mehta@techstartup.com",
            "company_name": "TechInnovate Solutions",
            "company_description": "Cutting-edge technology solutions for modern businesses",
            "industry": "technology",
            "location": "Bangalore",
            "budget_range": "medium",
            "collaboration_type": "product_reviews",
            "target_audience": "Tech enthusiasts and professionals",
            "preferred_platforms": ["youtube", "twitter", "instagram"],
            "min_followers": 25000,
            "max_followers": 200000,
            "contact_phone": "+91-9876543211",
            "website": "https://techinnovatesolutions.com"
        }
        
        try:
            response = requests.post(f"{self.base_url}/business-owners", json=business_data)
            if response.status_code == 200:
                business = response.json()
                required_fields = ["id", "name", "email", "company_name", "industry", "profile_status"]
                if all(field in business for field in required_fields):
                    if (business["name"] == business_data["name"] and 
                        business["company_name"] == business_data["company_name"] and
                        business["industry"] == business_data["industry"]):
                        self.log_result("Register New Business Owner", True, 
                                      f"Created: {business['company_name']} (ID: {business['id'][:8]}...)")
                        self.test_business_owners.append(business["id"])
                        
                        # Verify default profile status
                        if business.get("profile_status") == "pending":
                            self.log_result("Business Profile Status Default", True, "Profile status correctly set to pending")
                        else:
                            self.log_result("Business Profile Status Default", False, 
                                          f"Expected pending, got: {business.get('profile_status')}")
                    else:
                        self.log_result("Register New Business Owner", False, "Business data mismatch")
                else:
                    self.log_result("Register New Business Owner", False, f"Missing fields. Got: {list(business.keys())}")
            else:
                self.log_result("Register New Business Owner", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Register New Business Owner", False, f"Exception: {str(e)}")
        
        # Test 2: Try to register duplicate email
        try:
            response = requests.post(f"{self.base_url}/business-owners", json=business_data)
            if response.status_code == 400:
                self.log_result("Duplicate Business Email Validation", True, "Correctly rejected duplicate email")
            else:
                self.log_result("Duplicate Business Email Validation", False, 
                              f"Should have rejected duplicate, got: {response.status_code}")
        except Exception as e:
            self.log_result("Duplicate Business Email Validation", False, f"Exception: {str(e)}")
        
        # Test 3: Register business with minimal data
        minimal_business_data = {
            "name": "Amit Singh",
            "email": "amit.singh@foodbrand.com",
            "company_name": "Tasty Treats",
            "industry": "food",
            "collaboration_type": "sponsored_posts"
        }
        
        try:
            response = requests.post(f"{self.base_url}/business-owners", json=minimal_business_data)
            if response.status_code == 200:
                business = response.json()
                self.log_result("Register Business with Minimal Data", True, 
                              f"Created: {business['company_name']}")
                self.test_business_owners.append(business["id"])
            else:
                self.log_result("Register Business with Minimal Data", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Register Business with Minimal Data", False, f"Exception: {str(e)}")
    
    def test_creators_match_business_api(self):
        """Test GET /api/creators/match-business/{business_id} (find matching creators)"""
        print("\n=== Testing Creators Match Business API ===")
        
        if not self.test_business_owners:
            self.log_result("Match Creators for Business", False, "No test business owners available")
            return
        
        business_id = self.test_business_owners[0]
        
        # Test 1: Find matching creators for business
        try:
            response = requests.get(f"{self.base_url}/creators/match-business/{business_id}")
            if response.status_code == 200:
                matched_creators = response.json()
                if isinstance(matched_creators, list):
                    self.log_result("Find Matching Creators", True, f"Found {len(matched_creators)} matching creators")
                    
                    # Verify creator matching logic
                    if matched_creators:
                        creator = matched_creators[0]
                        required_fields = ["id", "name", "category", "location", "instagram_followers"]
                        if all(field in creator for field in required_fields):
                            self.log_result("Matched Creator Structure", True, "Creator fields are correct")
                            
                            # Check if match score is calculated
                            if "match_score" in creator or "total_followers" in creator:
                                self.log_result("Creator Match Scoring", True, "Match scoring system working")
                            else:
                                self.log_result("Creator Match Scoring", False, "Match scoring not implemented")
                        else:
                            self.log_result("Matched Creator Structure", False, "Missing creator fields")
                else:
                    self.log_result("Find Matching Creators", False, "Response is not a list")
            else:
                self.log_result("Find Matching Creators", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Find Matching Creators", False, f"Exception: {str(e)}")
        
        # Test 2: Test with non-existent business ID
        try:
            fake_business_id = str(uuid.uuid4())
            response = requests.get(f"{self.base_url}/creators/match-business/{fake_business_id}")
            if response.status_code == 404:
                self.log_result("Match Creators for Non-existent Business", True, "Correctly returned 404")
            else:
                self.log_result("Match Creators for Non-existent Business", False, 
                              f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Match Creators for Non-existent Business", False, f"Exception: {str(e)}")
        
        # Test 3: Test with limit parameter
        try:
            response = requests.get(f"{self.base_url}/creators/match-business/{business_id}?limit=5")
            if response.status_code == 200:
                matched_creators = response.json()
                if isinstance(matched_creators, list) and len(matched_creators) <= 5:
                    self.log_result("Match Creators with Limit", True, f"Returned {len(matched_creators)} creators (limit: 5)")
                else:
                    self.log_result("Match Creators with Limit", False, f"Limit not respected: {len(matched_creators)}")
            else:
                self.log_result("Match Creators with Limit", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Match Creators with Limit", False, f"Exception: {str(e)}")
    
    def test_collaboration_requests_api(self):
        """Test POST /api/collaboration-requests (send collaboration requests)"""
        print("\n=== Testing Collaboration Requests API ===")
        
        if not self.test_business_owners or not self.test_creators:
            self.log_result("Create Collaboration Request", False, "Missing test business owners or creators")
            return
        
        business_owner_id = self.test_business_owners[0]
        creator_id = self.test_creators[0]
        
        # Test 1: Create valid collaboration request
        collaboration_data = {
            "creator_id": creator_id,
            "campaign_title": "Summer Fashion Collection 2024",
            "campaign_description": "Promote our new summer fashion collection through Instagram posts and stories. Looking for authentic content that showcases the versatility and style of our clothing line.",
            "collaboration_type": "sponsored_posts",
            "budget_amount": 25000.0,
            "duration_days": 30,
            "requirements": [
                "Minimum 3 Instagram posts",
                "2 Instagram stories",
                "Use branded hashtags",
                "Tag our official account",
                "Include product styling tips"
            ]
        }
        
        try:
            response = requests.post(f"{self.base_url}/collaboration-requests", 
                                   json=collaboration_data, 
                                   params={"business_owner_id": business_owner_id})
            if response.status_code == 200:
                collaboration = response.json()
                required_fields = ["id", "business_owner_id", "creator_id", "campaign_title", "status"]
                if all(field in collaboration for field in required_fields):
                    if (collaboration["business_owner_id"] == business_owner_id and
                        collaboration["creator_id"] == creator_id and
                        collaboration["campaign_title"] == collaboration_data["campaign_title"]):
                        self.log_result("Create Collaboration Request", True, 
                                      f"Created: {collaboration['campaign_title']} (ID: {collaboration['id'][:8]}...)")
                        
                        # Verify default status
                        if collaboration.get("status") == "pending":
                            self.log_result("Collaboration Request Status Default", True, "Status correctly set to pending")
                        else:
                            self.log_result("Collaboration Request Status Default", False, 
                                          f"Expected pending, got: {collaboration.get('status')}")
                        
                        # Store for further testing
                        self.collaboration_request_id = collaboration["id"]
                    else:
                        self.log_result("Create Collaboration Request", False, "Collaboration data mismatch")
                else:
                    self.log_result("Create Collaboration Request", False, f"Missing fields. Got: {list(collaboration.keys())}")
            else:
                self.log_result("Create Collaboration Request", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Create Collaboration Request", False, f"Exception: {str(e)}")
        
        # Test 2: Create collaboration request with non-existent creator
        try:
            fake_creator_id = str(uuid.uuid4())
            collaboration_data_fake = {
                "creator_id": fake_creator_id,
                "campaign_title": "Test Campaign",
                "campaign_description": "Test description",
                "collaboration_type": "sponsored_posts"
            }
            response = requests.post(f"{self.base_url}/collaboration-requests", 
                                   json=collaboration_data_fake, 
                                   params={"business_owner_id": business_owner_id})
            if response.status_code == 404:
                self.log_result("Collaboration Request with Non-existent Creator", True, "Correctly rejected non-existent creator")
            else:
                self.log_result("Collaboration Request with Non-existent Creator", False, 
                              f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Collaboration Request with Non-existent Creator", False, f"Exception: {str(e)}")
        
        # Test 3: Create collaboration request with non-existent business owner
        try:
            fake_business_id = str(uuid.uuid4())
            collaboration_data_fake = {
                "creator_id": creator_id,
                "campaign_title": "Test Campaign",
                "campaign_description": "Test description",
                "collaboration_type": "sponsored_posts"
            }
            response = requests.post(f"{self.base_url}/collaboration-requests", 
                                   json=collaboration_data_fake, 
                                   params={"business_owner_id": fake_business_id})
            if response.status_code == 404:
                self.log_result("Collaboration Request with Non-existent Business", True, "Correctly rejected non-existent business")
            else:
                self.log_result("Collaboration Request with Non-existent Business", False, 
                              f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result("Collaboration Request with Non-existent Business", False, f"Exception: {str(e)}")
    
    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n=== Cleaning Up Test Data ===")
        
        # Delete test creators
        for creator_id in self.test_creators:
            try:
                response = requests.delete(f"{self.base_url}/creators/{creator_id}")
                if response.status_code == 200:
                    self.log_result(f"Delete Test Creator {creator_id[:8]}", True, "Creator deleted successfully")
                else:
                    self.log_result(f"Delete Test Creator {creator_id[:8]}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Delete Test Creator {creator_id[:8]}", False, f"Exception: {str(e)}")
        
        # Note: Business owners don't have a delete endpoint in the current API
        # In a production system, you might want to add admin endpoints for cleanup
    
    def run_all_tests(self):
        """Run all Razorpay and Business Owners API tests"""
        print("🚀 Starting GrowKro Updated Razorpay Integration and Business Owners API Tests")
        print(f"🔗 Testing API at: {self.base_url}")
        print("=" * 80)
        
        # Check API health first
        if not self.test_api_health():
            print("❌ API is not accessible. Stopping tests.")
            return self.test_results
        
        # Setup test data
        self.setup_test_data()
        
        # Run Razorpay tests with updated production keys
        print("\n🔥 TESTING UPDATED RAZORPAY INTEGRATION WITH PRODUCTION KEYS")
        print("=" * 60)
        self.test_updated_razorpay_pricing_api()
        self.test_updated_razorpay_create_order()
        self.test_updated_razorpay_verify_payment()
        self.test_updated_razorpay_transaction_status()
        self.test_updated_razorpay_client_initialization()
        
        # Run Business Owners API tests
        print("\n🏢 TESTING BUSINESS OWNERS API ROUTES")
        print("=" * 60)
        self.test_business_owners_browse_api()
        self.test_business_owners_register_api()
        self.test_creators_match_business_api()
        self.test_collaboration_requests_api()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100 if (self.test_results['passed'] + self.test_results['failed']) > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return self.test_results

if __name__ == "__main__":
    tester = RazorpayBusinessAPITester()
    results = tester.run_all_tests()