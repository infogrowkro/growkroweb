from fastapi import FastAPI, HTTPException, Request, Response, Cookie, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from datetime import datetime, timezone
import uuid
import json

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

# Pydantic Models
class Creator(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    bio: Optional[str] = ""
    instagram_handle: Optional[str] = ""
    youtube_handle: Optional[str] = ""
    instagram_followers: Optional[int] = 0
    youtube_subscribers: Optional[int] = 0
    highlight_package: Optional[str] = None  # silver, gold, platinum
    verification_status: bool = False
    profile_picture: Optional[str] = ""
    location: Optional[str] = ""
    category: Optional[str] = ""  # fashion, tech, lifestyle, food, etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreatorCreate(BaseModel):
    name: str
    email: str
    bio: Optional[str] = ""
    instagram_handle: Optional[str] = ""
    youtube_handle: Optional[str] = ""
    instagram_followers: Optional[int] = 0
    youtube_subscribers: Optional[int] = 0
    location: Optional[str] = ""
    category: Optional[str] = ""

class CreatorUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    instagram_handle: Optional[str] = None
    youtube_handle: Optional[str] = None
    instagram_followers: Optional[int] = None
    youtube_subscribers: Optional[int] = None
    location: Optional[str] = None
    category: Optional[str] = None
    profile_picture: Optional[str] = None

class HighlightPackage(BaseModel):
    id: str
    name: str
    price: int
    duration_days: int
    features: List[str]
    color: str
    description: str

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

# Predefined highlight packages
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