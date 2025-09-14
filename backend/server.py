from fastapi import FastAPI, HTTPException, Request, Response, Cookie, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import os
from datetime import datetime, timezone, timedelta
import uuid
import json
import razorpay
import hmac
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="GrowKro API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.growkro

# Razorpay client initialization
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "your_razorpay_secret") # For demo, will be configured properly

if RAZORPAY_KEY_ID:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

# Pydantic Models
class Creator(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    bio: Optional[str] = ""
    # Social Media Handles and Followers
    instagram_handle: Optional[str] = ""
    instagram_followers: Optional[int] = 0
    youtube_handle: Optional[str] = ""
    youtube_subscribers: Optional[int] = 0
    twitter_handle: Optional[str] = ""
    twitter_followers: Optional[int] = 0
    tiktok_handle: Optional[str] = ""
    tiktok_followers: Optional[int] = 0
    snapchat_handle: Optional[str] = ""
    snapchat_followers: Optional[int] = 0
    # Profile Information
    highlight_package: Optional[str] = None  # silver, gold, platinum
    verification_status: bool = False
    profile_picture: Optional[str] = ""
    location: Optional[str] = ""
    category: Optional[str] = ""  # fashion, tech, lifestyle, food, etc.
    # Admin Management Fields
    profile_status: str = "pending"  # pending, approved, rejected, suspended
    admin_notes: Optional[str] = ""
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreatorCreate(BaseModel):
    name: str
    email: str
    bio: Optional[str] = ""
    instagram_handle: Optional[str] = ""
    instagram_followers: Optional[int] = 0
    youtube_handle: Optional[str] = ""
    youtube_subscribers: Optional[int] = 0
    twitter_handle: Optional[str] = ""
    twitter_followers: Optional[int] = 0
    tiktok_handle: Optional[str] = ""
    tiktok_followers: Optional[int] = 0
    snapchat_handle: Optional[str] = ""
    snapchat_followers: Optional[int] = 0
    location: Optional[str] = ""
    category: Optional[str] = ""

class CreatorUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    instagram_handle: Optional[str] = None
    instagram_followers: Optional[int] = None
    youtube_handle: Optional[str] = None
    youtube_subscribers: Optional[int] = None
    twitter_handle: Optional[str] = None
    twitter_followers: Optional[int] = None
    tiktok_handle: Optional[str] = None
    tiktok_followers: Optional[int] = None
    snapchat_handle: Optional[str] = None
    snapchat_followers: Optional[int] = None
    location: Optional[str] = None
    category: Optional[str] = None
    profile_picture: Optional[str] = None

class AdminAction(BaseModel):
    creator_id: str
    action: str  # approve, reject, suspend, activate
    notes: Optional[str] = ""

class NotificationRequest(BaseModel):
    title: str
    message: str
    target: str = "all"  # all, subscribed, creators, specific_users
    user_ids: Optional[List[str]] = []

class HighlightPackage(BaseModel):
    id: str
    name: str
    price: int
    duration_days: int
    features: List[str]
    color: str
    description: str

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    order_id: str  # Razorpay order ID
    payment_id: Optional[str] = None  # Razorpay payment ID
    payment_type: str  # subscription, verification, highlight_package
    amount: int  # Amount in paise (multiply by 100)
    currency: str = "INR"
    status: str = "pending"  # pending, completed, failed, cancelled
    payment_status: str = "created"  # created, authorized, captured, refunded, failed
    metadata: Optional[Dict] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentOrderRequest(BaseModel):
    payment_type: str  # subscription, verification, highlight_package
    package_id: Optional[str] = None  # For highlight packages
    creator_id: Optional[str] = None  # For verification
    amount: Optional[int] = None  # For custom amounts (in paise)

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str

class PaymentVerificationRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str

# Helper functions
def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Parse MongoDB document back to proper types"""
    if item and isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if item and isinstance(item.get('updated_at'), str):
        item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return item

# Payment pricing configuration (amounts in paise)
PAYMENT_PRICING = {
    "subscription": {
        "annual": 4900,  # ₹49
        "name": "Annual Subscription",
        "description": "Access all creator features for 1 year"
    },
    "verification": {
        "profile": 19900,  # ₹199
        "name": "Profile Verification",
        "description": "Get verified creator badge"
    },
    "highlight_package": {
        "silver": 499900,  # ₹4999
        "gold": 999900,    # ₹9999
        "platinum": 999900 # ₹9999
    }
}
HIGHLIGHT_PACKAGES = [
    {
        "id": "silver",
        "name": "Silver Highlight",
        "price": 4999,
        "duration_days": 30,
        "features": [
            "Profile highlighting for 30 days",
            "Priority in search results",
            "Silver badge on profile",
            "Basic analytics"
        ],
        "color": "#C0C0C0",
        "description": "Get noticed with our Silver highlight package"
    },
    {
        "id": "gold",
        "name": "Gold Highlight", 
        "price": 9999,
        "duration_days": 60,
        "features": [
            "Profile highlighting for 60 days",
            "Top priority in search results",
            "Gold badge on profile",
            "Advanced analytics",
            "Featured in weekly newsletter"
        ],
        "color": "#FFD700",
        "description": "Stand out with our premium Gold highlight package"
    },
    {
        "id": "platinum",
        "name": "Platinum Highlight",
        "price": 9999,
        "duration_days": 90,
        "features": [
            "Profile highlighting for 90 days",
            "Maximum priority in search results",
            "Platinum badge on profile", 
            "Premium analytics dashboard",
            "Featured in weekly newsletter",
            "Direct collaboration opportunities"
        ],
        "color": "#E5E4E2",
        "description": "Ultimate visibility with our Platinum highlight package"
    }
]

# API Routes

@app.get("/")
async def root():
    return {"message": "GrowKro API is running!", "status": "active"}

# Creator Profile Routes
@app.get("/api/creators", response_model=List[Creator])
async def get_creators(
    category: Optional[str] = None,
    location: Optional[str] = None,
    verified_only: Optional[bool] = False,
    package: Optional[str] = None,
    limit: Optional[int] = 20,
    skip: Optional[int] = 0
):
    """Get list of creators with optional filtering"""
    try:
        # Build filter query
        filter_query = {}
        if category:
            filter_query["category"] = {"$regex": category, "$options": "i"}
        if location:
            filter_query["location"] = {"$regex": location, "$options": "i"}
        if verified_only:
            filter_query["verification_status"] = True
        if package:
            filter_query["highlight_package"] = package

        # Get creators from database
        cursor = db.creators.find(filter_query).skip(skip).limit(limit)
        creators = await cursor.to_list(length=limit)
        
        # Parse each creator
        parsed_creators = []
        for creator in creators:
            parsed_creator = parse_from_mongo(creator)
            if parsed_creator:
                parsed_creators.append(Creator(**parsed_creator))
        
        return parsed_creators
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching creators: {str(e)}")

@app.get("/api/creators/{creator_id}", response_model=Creator)
async def get_creator(creator_id: str):
    """Get specific creator by ID"""
    try:
        creator = await db.creators.find_one({"id": creator_id})
        if not creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        parsed_creator = parse_from_mongo(creator)
        return Creator(**parsed_creator)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching creator: {str(e)}")

@app.post("/api/creators", response_model=Creator)
async def create_creator(creator_data: CreatorCreate):
    """Create new creator profile"""
    try:
        # Check if email already exists
        existing_creator = await db.creators.find_one({"email": creator_data.email})
        if existing_creator:
            raise HTTPException(status_code=400, detail="Creator with this email already exists")
        
        # Create new creator
        creator = Creator(**creator_data.dict())
        creator_dict = creator.dict()
        creator_dict = prepare_for_mongo(creator_dict)
        
        # Insert into database
        await db.creators.insert_one(creator_dict)
        
        return creator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating creator: {str(e)}")

@app.put("/api/creators/{creator_id}", response_model=Creator)
async def update_creator(creator_id: str, update_data: CreatorUpdate):
    """Update creator profile"""
    try:
        # Check if creator exists
        existing_creator = await db.creators.find_one({"id": creator_id})
        if not existing_creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        # Prepare update data
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        if update_dict:
            update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            # Update in database
            await db.creators.update_one(
                {"id": creator_id},
                {"$set": update_dict}
            )
        
        # Return updated creator
        updated_creator = await db.creators.find_one({"id": creator_id})
        parsed_creator = parse_from_mongo(updated_creator)
        return Creator(**parsed_creator)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating creator: {str(e)}")

@app.delete("/api/creators/{creator_id}")
async def delete_creator(creator_id: str):
    """Delete creator profile"""
    try:
        result = await db.creators.delete_one({"id": creator_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        return {"message": "Creator deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting creator: {str(e)}")

# Highlight Package Routes
@app.get("/api/packages", response_model=List[HighlightPackage])
async def get_packages():
    """Get all highlight packages"""
    try:
        return [HighlightPackage(**package) for package in HIGHLIGHT_PACKAGES]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching packages: {str(e)}")

@app.get("/api/packages/{package_id}", response_model=HighlightPackage)
async def get_package(package_id: str):
    """Get specific highlight package"""
    try:
        package = next((p for p in HIGHLIGHT_PACKAGES if p["id"] == package_id), None)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        return HighlightPackage(**package)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching package: {str(e)}")

@app.post("/api/creators/{creator_id}/upgrade-package/{package_id}")
async def upgrade_creator_package(creator_id: str, package_id: str):
    """Upgrade creator's highlight package"""
    try:
        # Verify package exists
        package = next((p for p in HIGHLIGHT_PACKAGES if p["id"] == package_id), None)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Verify creator exists
        creator = await db.creators.find_one({"id": creator_id})
        if not creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        # Update creator's package
        await db.creators.update_one(
            {"id": creator_id},
            {"$set": {
                "highlight_package": package_id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {"message": f"Creator upgraded to {package['name']} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error upgrading package: {str(e)}")

# Search and Discovery Routes
@app.get("/api/search/creators")
async def search_creators(
    q: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_followers: Optional[int] = None,
    max_followers: Optional[int] = None,
    limit: Optional[int] = 20
):
    """Search creators with advanced filters"""
    try:
        filter_query = {}
        
        # Text search
        if q:
            filter_query["$or"] = [
                {"name": {"$regex": q, "$options": "i"}},
                {"bio": {"$regex": q, "$options": "i"}},
                {"category": {"$regex": q, "$options": "i"}}
            ]
        
        # Category filter
        if category:
            filter_query["category"] = {"$regex": category, "$options": "i"}
            
        # Location filter
        if location:
            filter_query["location"] = {"$regex": location, "$options": "i"}
            
        # Follower count filters
        follower_filter = {}
        if min_followers:
            follower_filter["$gte"] = min_followers
        if max_followers:
            follower_filter["$lte"] = max_followers
        if follower_filter:
            filter_query["$or"] = [
                {"instagram_followers": follower_filter},
                {"youtube_subscribers": follower_filter}
            ]
        
        # Execute search
        cursor = db.creators.find(filter_query).limit(limit)
        creators = await cursor.to_list(length=limit)
        
        # Parse results
        parsed_creators = []
        for creator in creators:
            parsed_creator = parse_from_mongo(creator)
            if parsed_creator:
                parsed_creators.append(Creator(**parsed_creator))
        
        return {"results": parsed_creators, "count": len(parsed_creators)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching creators: {str(e)}")

# Payment Routes
@app.post("/api/payments/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(request: PaymentOrderRequest):
    """Create Razorpay payment order"""
    try:
        if not razorpay_client:
            raise HTTPException(status_code=500, detail="Payment system not configured")
        
        # Determine amount based on payment type
        amount = 0
        description = ""
        
        if request.payment_type == "subscription":
            amount = PAYMENT_PRICING["subscription"]["annual"]
            description = PAYMENT_PRICING["subscription"]["description"]
        elif request.payment_type == "verification":
            amount = PAYMENT_PRICING["verification"]["profile"]
            description = PAYMENT_PRICING["verification"]["description"]
        elif request.payment_type == "highlight_package" and request.package_id:
            if request.package_id in PAYMENT_PRICING["highlight_package"]:
                amount = PAYMENT_PRICING["highlight_package"][request.package_id]
                description = f"{request.package_id.title()} Highlight Package"
            else:
                raise HTTPException(status_code=400, detail="Invalid package ID")
        elif request.amount:
            amount = request.amount
            description = f"Custom payment - {request.payment_type}"
        else:
            raise HTTPException(status_code=400, detail="Invalid payment request")
        
        # Create Razorpay order
        order_data = {
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "payment_type": request.payment_type,
                "package_id": request.package_id,
                "creator_id": request.creator_id,
                "description": description
            }
        }
        
        razorpay_order = razorpay_client.order.create(order_data)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            order_id=razorpay_order["id"],
            payment_type=request.payment_type,
            amount=amount,
            status="created",
            payment_status="created",
            metadata={
                "package_id": request.package_id,
                "creator_id": request.creator_id,
                "description": description
            }
        )
        
        transaction_dict = transaction.dict()
        transaction_dict = prepare_for_mongo(transaction_dict)
        await db.payment_transactions.insert_one(transaction_dict)
        
        return PaymentOrderResponse(
            order_id=razorpay_order["id"],
            amount=amount,
            currency="INR",
            key_id=RAZORPAY_KEY_ID
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment order: {str(e)}")

@app.post("/api/payments/verify")
async def verify_payment(verification: PaymentVerificationRequest):
    """Verify Razorpay payment"""
    try:
        if not razorpay_client:
            raise HTTPException(status_code=500, detail="Payment system not configured")
        
        # Verify payment signature
        params_dict = {
            'razorpay_order_id': verification.order_id,
            'razorpay_payment_id': verification.payment_id,
            'razorpay_signature': verification.signature
        }
        
        try:
            razorpay_client.utility.verify_payment_signature(params_dict)
        except:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Update transaction record
        transaction = await db.payment_transactions.find_one({"order_id": verification.order_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Payment transaction not found")
        
        # Update payment status
        await db.payment_transactions.update_one(
            {"order_id": verification.order_id},
            {"$set": {
                "payment_id": verification.payment_id,
                "status": "completed",
                "payment_status": "captured",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Process the payment based on type
        await process_payment_success(transaction, verification.payment_id)
        
        return {"status": "success", "message": "Payment verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying payment: {str(e)}")

async def process_payment_success(transaction: Dict, payment_id: str):
    """Process successful payment and update user/creator records"""
    try:
        payment_type = transaction.get("payment_type")
        metadata = transaction.get("metadata", {})
        
        if payment_type == "subscription":
            # Update user subscription status
            user_email = transaction.get("user_email")
            if user_email:
                # In a real app, you'd update user record
                # For demo, this would integrate with user management
                pass
                
        elif payment_type == "verification":
            # Update creator verification status
            creator_id = metadata.get("creator_id")
            if creator_id:
                await db.creators.update_one(
                    {"id": creator_id},
                    {"$set": {
                        "verification_status": True,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
        elif payment_type == "highlight_package":
            # Update creator highlight package
            creator_id = metadata.get("creator_id")
            package_id = metadata.get("package_id")
            if creator_id and package_id:
                await db.creators.update_one(
                    {"id": creator_id},
                    {"$set": {
                        "highlight_package": package_id,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
    except Exception as e:
        print(f"Error processing payment success: {str(e)}")

@app.get("/api/payments/transaction/{order_id}")
async def get_transaction_status(order_id: str):
    """Get payment transaction status"""
    try:
        transaction = await db.payment_transactions.find_one({"order_id": order_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        parsed_transaction = parse_from_mongo(transaction)
        return PaymentTransaction(**parsed_transaction)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transaction: {str(e)}")

@app.get("/api/payments/pricing")
async def get_payment_pricing():
    """Get payment pricing information"""
    try:
        return {
            "subscription": {
                "annual": {
                    "amount": PAYMENT_PRICING["subscription"]["annual"],
                    "amount_inr": PAYMENT_PRICING["subscription"]["annual"] / 100,
                    "name": PAYMENT_PRICING["subscription"]["name"],
                    "description": PAYMENT_PRICING["subscription"]["description"]
                }
            },
            "verification": {
                "profile": {
                    "amount": PAYMENT_PRICING["verification"]["profile"],
                    "amount_inr": PAYMENT_PRICING["verification"]["profile"] / 100,
                    "name": PAYMENT_PRICING["verification"]["name"],
                    "description": PAYMENT_PRICING["verification"]["description"]
                }
            },
            "highlight_packages": {
                package_id: {
                    "amount": amount,
                    "amount_inr": amount / 100,
                    "name": f"{package_id.title()} Package"
                }
                for package_id, amount in PAYMENT_PRICING["highlight_package"].items()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pricing: {str(e)}")

# Stats and Analytics Routes
@app.get("/api/stats")
async def get_platform_stats():
    """Get platform statistics"""
    try:
        total_creators = await db.creators.count_documents({})
        verified_creators = await db.creators.count_documents({"verification_status": True})
        silver_users = await db.creators.count_documents({"highlight_package": "silver"})
        gold_users = await db.creators.count_documents({"highlight_package": "gold"})
        platinum_users = await db.creators.count_documents({"highlight_package": "platinum"})
        
        return {
            "total_creators": total_creators,
            "verified_creators": verified_creators,
            "highlight_packages": {
                "silver": silver_users,
                "gold": gold_users,
                "platinum": platinum_users
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)