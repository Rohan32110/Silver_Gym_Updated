from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from enum import Enum
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'silver_gym_secret_key_2024')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'Silver Gym')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'silver101')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enums
class UserStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ExerciseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class PaymentStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str
    status: UserStatus = UserStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.UNPAID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    total_stars: int = 0

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class Exercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    level: ExerciseLevel

class Progress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    exercise_id: str
    completed_date: datetime = Field(default_factory=datetime.utcnow)
    stars_earned: int = 1

class UserUpdate(BaseModel):
    status: Optional[UserStatus] = None
    payment_status: Optional[PaymentStatus] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        is_admin: bool = payload.get("is_admin", False)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        return True
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Background task for daily reset
async def daily_reset_task():
    while True:
        now = datetime.utcnow()
        # Calculate time until 11:59 PM UTC
        next_reset = now.replace(hour=23, minute=59, second=0, microsecond=0)
        if now >= next_reset:
            next_reset += timedelta(days=1)
        
        sleep_seconds = (next_reset - now).total_seconds()
        await asyncio.sleep(sleep_seconds)
        
        # Reset all daily progress
        try:
            await db.progress.delete_many({})
            await db.users.update_many({}, {"$set": {"total_stars": 0}})
            print(f"Daily reset completed at {datetime.utcnow()}")
        except Exception as e:
            print(f"Error during daily reset: {e}")

# Initialize exercises
INITIAL_EXERCISES = [
    # Beginner Level
    {"name": "Push-ups", "description": "Basic upper body strength exercise. Start in plank position. Lower your body until chest nearly touches floor. Push back up.", "level": "beginner"},
    {"name": "Bodyweight Squats", "description": "Lower body strength exercise. Stand with feet shoulder-width apart. Lower body as if sitting back into a chair. Return to standing.", "level": "beginner"},
    {"name": "Plank", "description": "Core strengthening exercise. Hold a push-up position, keeping your body straight from head to heels for 30-60 seconds.", "level": "beginner"},
    {"name": "Lunges", "description": "Single leg exercise. Step forward into lunge position. Lower hips until both knees are at 90 degrees. Step back and repeat.", "level": "beginner"},
    {"name": "Wall Sit", "description": "Isometric leg exercise. Lean back against wall with thighs parallel to ground. Hold position.", "level": "beginner"},
    {"name": "Modified Burpees", "description": "Full body cardio exercise. Squat down, jump or step back to plank, return to squat, stand up.", "level": "beginner"},
    {"name": "Knee Push-ups", "description": "Modified push-up for building strength. Perform push-ups from knees instead of toes.", "level": "beginner"},
    {"name": "Glute Bridges", "description": "Lower body and core exercise. Lie on back, lift hips up by squeezing glutes, lower back down.", "level": "beginner"},
    {"name": "Mountain Climbers", "description": "Cardio and core exercise. Start in plank position, alternate bringing knees to chest rapidly.", "level": "beginner"},
    {"name": "Tricep Dips", "description": "Upper body exercise using chair or bench. Lower body by bending arms, push back up.", "level": "beginner"},

    # Intermediate Level
    {"name": "Pull-ups", "description": "Upper body pulling exercise. Hang from bar with overhand grip. Pull body up until chin clears bar.", "level": "intermediate"},
    {"name": "Dumbbell Bench Press", "description": "Chest exercise with weights. Lie on bench, press dumbbells from chest level to full arm extension.", "level": "intermediate"},
    {"name": "Barbell Rows", "description": "Back exercise. Bend at hips, pull barbell to lower chest/upper abdomen, lower with control.", "level": "intermediate"},
    {"name": "Overhead Press", "description": "Shoulder exercise. Press weight from shoulder level to overhead, lower back to shoulders.", "level": "intermediate"},
    {"name": "Deadlifts", "description": "Full body exercise. Lift barbell from ground to hip level by driving through heels and extending hips.", "level": "intermediate"},
    {"name": "Weighted Squats", "description": "Lower body exercise with added weight. Perform squats while holding dumbbells or barbell.", "level": "intermediate"},
    {"name": "Dips", "description": "Upper body exercise on parallel bars. Lower body by bending arms, push back up to starting position.", "level": "intermediate"},
    {"name": "Russian Twists", "description": "Core exercise. Sit with knees bent, lean back slightly, rotate torso side to side.", "level": "intermediate"},
    {"name": "Box Jumps", "description": "Explosive leg exercise. Jump onto box or platform, step down and repeat.", "level": "intermediate"},
    {"name": "Pike Push-ups", "description": "Shoulder-focused push-up variation. Start in downward dog position, lower head toward ground.", "level": "intermediate"},

    # Advanced Level
    {"name": "Muscle-ups", "description": "Advanced upper body exercise. Combine pull-up with dip movement to get body above bar.", "level": "advanced"},
    {"name": "Pistol Squats", "description": "Single leg squat. Lower on one leg while extending other leg forward, return to standing.", "level": "advanced"},
    {"name": "Handstand Push-ups", "description": "Inverted push-up against wall. Lower head toward ground, press back to handstand position.", "level": "advanced"},
    {"name": "Heavy Deadlifts", "description": "Advanced deadlift with heavy weight. Focus on perfect form with challenging weight.", "level": "advanced"},
    {"name": "Weighted Pull-ups", "description": "Pull-ups with additional weight. Add weight belt or hold dumbbell between feet.", "level": "advanced"},
    {"name": "Front Squats", "description": "Squat with barbell in front rack position. Requires core strength and mobility.", "level": "advanced"},
    {"name": "Turkish Get-ups", "description": "Complex full-body movement. Move from lying to standing while holding weight overhead.", "level": "advanced"},
    {"name": "Archer Push-ups", "description": "Unilateral push-up variation. Shift weight to one arm while performing push-up.", "level": "advanced"},
    {"name": "Dragon Flags", "description": "Advanced core exercise. Lie on bench, lift entire body using only shoulders as contact point.", "level": "advanced"},
    {"name": "One-Arm Rows", "description": "Unilateral pulling exercise. Row heavy weight with one arm while supporting body with other.", "level": "advanced"}
]

# Routes
@api_router.get("/")
async def root():
    return {"message": "Silver Gym API is running"}

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    await db.users.insert_one(user.dict())
    return {"message": "User registered successfully. Wait for admin approval."}

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user["status"] != UserStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Account not approved yet")
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "total_stars": user["total_stars"]
    }}

@api_router.post("/auth/admin/login")
async def admin_login(admin_data: AdminLogin):
    if admin_data.username != ADMIN_USERNAME or admin_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    access_token = create_access_token(data={"sub": "admin", "is_admin": True})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/exercises/{level}")
async def get_exercises(level: ExerciseLevel, current_user: User = Depends(get_current_user)):
    exercises = await db.exercises.find({"level": level}).to_list(1000)
    # Convert MongoDB ObjectId to string to make it JSON serializable
    for exercise in exercises:
        if '_id' in exercise:
            exercise['_id'] = str(exercise['_id'])
    return exercises

@api_router.post("/exercises/{exercise_id}/complete")
async def complete_exercise(exercise_id: str, current_user: User = Depends(get_current_user)):
    # Check if already completed today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    existing_progress = await db.progress.find_one({
        "user_id": current_user.id,
        "exercise_id": exercise_id,
        "completed_date": {"$gte": today, "$lt": tomorrow}
    })
    
    if existing_progress:
        raise HTTPException(status_code=400, detail="Exercise already completed today")
    
    # Add progress
    progress = Progress(user_id=current_user.id, exercise_id=exercise_id)
    await db.progress.insert_one(progress.dict())
    
    # Update user's total stars
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"total_stars": 1}}
    )
    
    return {"message": "Exercise completed!", "stars_earned": 1}

@api_router.get("/user/dashboard")
async def get_user_dashboard(current_user: User = Depends(get_current_user)):
    # Get today's completed exercises
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    today_progress = await db.progress.find({
        "user_id": current_user.id,
        "completed_date": {"$gte": today, "$lt": tomorrow}
    }).to_list(1000)
    
    # Convert MongoDB ObjectId to string
    for progress in today_progress:
        if '_id' in progress:
            progress['_id'] = str(progress['_id'])
    
    completed_today = len(today_progress)
    
    # Get updated user data
    user_data = await db.users.find_one({"id": current_user.id})
    
    return {
        "total_stars": user_data["total_stars"],
        "completed_today": completed_today,
        "today_exercises": [p["exercise_id"] for p in today_progress]
    }

@api_router.get("/admin/users")
async def get_all_users(admin: bool = Depends(get_current_admin)):
    users = await db.users.find().to_list(1000)
    # Convert MongoDB ObjectId to string to make it JSON serializable
    for user in users:
        if '_id' in user:
            user['_id'] = str(user['_id'])
    return users

@api_router.put("/admin/users/{user_id}")
async def update_user(user_id: str, update_data: UserUpdate, admin: bool = Depends(get_current_admin)):
    update_dict = {}
    if update_data.status is not None:
        update_dict["status"] = update_data.status
    if update_data.payment_status is not None:
        update_dict["payment_status"] = update_data.payment_status
    
    if update_dict:
        await db.users.update_one({"id": user_id}, {"$set": update_dict})
    
    return {"message": "User updated successfully"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: bool = Depends(get_current_admin)):
    await db.users.delete_one({"id": user_id})
    await db.progress.delete_many({"user_id": user_id})
    return {"message": "User deleted successfully"}

@api_router.post("/admin/reset-payments")
async def reset_payments(admin: bool = Depends(get_current_admin)):
    await db.users.update_many({}, {"$set": {"payment_status": PaymentStatus.UNPAID}})
    return {"message": "All payment statuses reset to unpaid"}

@api_router.post("/admin/clear-workout-data")
async def clear_workout_data(admin: bool = Depends(get_current_admin)):
    # Clear all progress data
    await db.progress.delete_many({})
    # Reset all user stars to 0
    await db.users.update_many({}, {"$set": {"total_stars": 0}})
    return {"message": "All workout data cleared successfully"}

@api_router.get("/admin/stats")
async def get_admin_stats(admin: bool = Depends(get_current_admin)):
    total_users = await db.users.count_documents({})
    pending_approval = await db.users.count_documents({"status": UserStatus.PENDING})
    active_members = await db.users.count_documents({"status": UserStatus.APPROVED})
    paid_members = await db.users.count_documents({"payment_status": PaymentStatus.PAID})
    
    return {
        "total_users": total_users,
        "pending_approval": pending_approval,
        "active_members": active_members,
        "paid_members": paid_members
    }

# Initialize database
async def init_database():
    # Initialize exercises if not exists
    exercise_count = await db.exercises.count_documents({})
    if exercise_count == 0:
        exercises = [Exercise(**ex).dict() for ex in INITIAL_EXERCISES]
        await db.exercises.insert_many(exercises)
        print("Exercises initialized")

@app.on_event("startup")
async def startup_event():
    await init_database()
    # Start the daily reset background task
    asyncio.create_task(daily_reset_task())
    print("Daily reset task started")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
