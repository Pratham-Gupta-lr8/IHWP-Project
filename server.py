from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    body_type: Optional[str] = None
    lifestyle: Optional[str] = None
    health_concerns: Optional[List[str]] = []
    prakriti_type: Optional[str] = None
    prakriti_analysis: Optional[Dict[str, Any]] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PrakritiQuestion(BaseModel):
    question: str
    options: List[str]
    category: str

class PrakritiResponse(BaseModel):
    answers: Dict[str, str]

class DietPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prakriti_type: str
    recommended_foods: List[str]
    avoid_foods: List[str]
    meal_timings: Dict[str, str]
    seasonal_tips: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DailySchedule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prakriti_type: str
    wake_time: str
    sleep_time: str
    activities: List[Dict[str, str]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FollowUp(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: datetime
    notes: Optional[str] = None
    progress_rating: Optional[int] = None
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Auth Helper
async def get_current_user(request: Request) -> User:
    session_token = request.cookies.get('session_token')
    if not session_token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header.replace('Bearer ', '')
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": session_token})
    if not session or session['expires_at'] < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"id": session['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user)

# Auth Routes
@api_router.get("/auth/session")
async def create_session(session_id: str, response: Response):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            resp.raise_for_status()
            data = resp.json()
            
            # Check if user exists
            existing_user = await db.users.find_one({"email": data['email']}, {"_id": 0})
            
            if not existing_user:
                user = User(
                    id=data['id'],
                    email=data['email'],
                    name=data['name'],
                    picture=data.get('picture')
                )
                await db.users.insert_one(user.model_dump())
            else:
                user = User(**existing_user)
            
            # Create session
            session_token = data['session_token']
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)
            
            session = UserSession(
                user_id=user.id,
                session_token=session_token,
                expires_at=expires_at
            )
            await db.user_sessions.insert_one(session.model_dump())
            
            # Set cookie
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=True,
                samesite="none",
                max_age=7*24*60*60,
                path="/"
            )
            
            return {"user": user.model_dump(), "success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, user: User = Depends(get_current_user)):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"success": True}

# Profile Routes
@api_router.get("/profile", response_model=UserProfile)
async def get_profile(user: User = Depends(get_current_user)):
    profile = await db.user_profiles.find_one({"user_id": user.id}, {"_id": 0})
    if not profile:
        profile = UserProfile(user_id=user.id).model_dump()
        await db.user_profiles.insert_one(profile)
    return UserProfile(**profile)

@api_router.put("/profile")
async def update_profile(profile_data: Dict[str, Any], user: User = Depends(get_current_user)):
    profile_data['user_id'] = user.id
    profile_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.user_profiles.update_one(
        {"user_id": user.id},
        {"$set": profile_data},
        upsert=True
    )
    return {"success": True}

# Prakriti Analysis
PRAKRITI_QUESTIONS = [
    {"question": "Your body frame is:", "options": ["Thin, light (Vata)", "Medium, muscular (Pitta)", "Large, heavy (Kapha)"], "category": "physical"},
    {"question": "Your skin type is:", "options": ["Dry, rough, cool (Vata)", "Warm, oily, prone to rashes (Pitta)", "Thick, oily, cool (Kapha)"], "category": "physical"},
    {"question": "Your hair is:", "options": ["Dry, thin, dark (Vata)", "Fine, oily, early graying (Pitta)", "Thick, oily, wavy (Kapha)"], "category": "physical"},
    {"question": "Your appetite is:", "options": ["Irregular, variable (Vata)", "Strong, sharp (Pitta)", "Steady, can skip meals (Kapha)"], "category": "digestion"},
    {"question": "Your sleep pattern is:", "options": ["Light, interrupted (Vata)", "Moderate, sound (Pitta)", "Deep, long (Kapha)"], "category": "lifestyle"},
    {"question": "Your energy level is:", "options": ["Comes in bursts (Vata)", "Moderate, focused (Pitta)", "Steady, enduring (Kapha)"], "category": "mental"},
    {"question": "Under stress, you tend to:", "options": ["Feel anxious, worried (Vata)", "Become irritable, angry (Pitta)", "Withdraw, feel depressed (Kapha)"], "category": "mental"},
    {"question": "Your learning style is:", "options": ["Quick to learn, quick to forget (Vata)", "Sharp, focused (Pitta)", "Slow to learn, good retention (Kapha)"], "category": "mental"},
    {"question": "Your body temperature is usually:", "options": ["Cold hands and feet (Vata)", "Warm, dislike heat (Pitta)", "Moderate, tolerate cold (Kapha)"], "category": "physical"},
    {"question": "Your decision-making is:", "options": ["Quick, changeable (Vata)", "Decisive, confident (Pitta)", "Slow, methodical (Kapha)"], "category": "mental"}
]

@api_router.get("/prakriti/questions")
async def get_prakriti_questions():
    return PRAKRITI_QUESTIONS

@api_router.post("/prakriti/analyze")
async def analyze_prakriti(response_data: PrakritiResponse, user: User = Depends(get_current_user)):
    answers = response_data.answers
    
    # Count dosha types
    vata_count = sum(1 for ans in answers.values() if 'Vata' in ans)
    pitta_count = sum(1 for ans in answers.values() if 'Pitta' in ans)
    kapha_count = sum(1 for ans in answers.values() if 'Kapha' in ans)
    
    # Determine primary dosha
    counts = {'Vata': vata_count, 'Pitta': pitta_count, 'Kapha': kapha_count}
    primary_dosha = max(counts, key=counts.get)
    
    # AI Analysis
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"prakriti_{user.id}",
        system_message="You are an Ayurvedic practitioner providing personalized health insights based on Prakriti analysis."
    ).with_model("openai", "gpt-4o-mini")
    
    user_message = UserMessage(
        text=f"""Based on the following Prakriti assessment results:
        Vata score: {vata_count}/10
        Pitta score: {pitta_count}/10
        Kapha score: {kapha_count}/10
        Primary Dosha: {primary_dosha}
        
        Provide a brief, personalized analysis (3-4 sentences) explaining:
        1. What this Prakriti type means
        2. Key physical and mental characteristics
        3. General wellness recommendations
        
        Keep it warm, encouraging, and easy to understand."""
    )
    
    ai_analysis = await chat.send_message(user_message)
    
    analysis_result = {
        "prakriti_type": primary_dosha,
        "scores": counts,
        "ai_insights": ai_analysis,
        "analyzed_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update user profile
    await db.user_profiles.update_one(
        {"user_id": user.id},
        {"$set": {
            "prakriti_type": primary_dosha,
            "prakriti_analysis": analysis_result,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return analysis_result

# Diet Chart Routes
@api_router.get("/diet-plan")
async def get_diet_plan(user: User = Depends(get_current_user)):
    profile = await db.user_profiles.find_one({"user_id": user.id})
    if not profile or not profile.get('prakriti_type'):
        raise HTTPException(status_code=400, detail="Please complete Prakriti analysis first")
    
    diet_plan = await db.diet_plans.find_one({"user_id": user.id}, {"_id": 0})
    if diet_plan:
        return diet_plan
    
    # Generate diet plan
    prakriti = profile['prakriti_type']
    diet_recommendations = {
        "Vata": {
            "recommended_foods": ["Warm, cooked foods", "Root vegetables", "Nuts and seeds", "Ghee and oils", "Sweet fruits", "Warm milk", "Rice and wheat"],
            "avoid_foods": ["Cold foods", "Raw vegetables", "Dry foods", "Beans (except mung)", "Caffeine", "Carbonated drinks"],
            "meal_timings": {"breakfast": "7:00-8:00 AM", "lunch": "12:00-1:00 PM", "dinner": "6:00-7:00 PM"},
            "seasonal_tips": ["Eat warm, nourishing soups in winter", "Favor sweet, sour, and salty tastes", "Stay hydrated with warm water"]
        },
        "Pitta": {
            "recommended_foods": ["Cool, refreshing foods", "Sweet fruits", "Leafy greens", "Cucumber", "Coconut", "Dairy products", "Barley and oats"],
            "avoid_foods": ["Spicy foods", "Citrus fruits", "Tomatoes", "Fermented foods", "Red meat", "Alcohol", "Fried foods"],
            "meal_timings": {"breakfast": "7:30-8:30 AM", "lunch": "12:00-1:00 PM", "dinner": "6:30-7:30 PM"},
            "seasonal_tips": ["Eat cooling foods in summer", "Favor sweet, bitter, and astringent tastes", "Avoid eating when angry or stressed"]
        },
        "Kapha": {
            "recommended_foods": ["Light, warm foods", "Bitter vegetables", "Legumes", "Spices (ginger, turmeric)", "Honey", "Quinoa and millet", "Apples and pears"],
            "avoid_foods": ["Heavy, oily foods", "Dairy products", "Sweet fruits", "Wheat", "Cold foods", "Excessive salt"],
            "meal_timings": {"breakfast": "7:00-8:00 AM (light)", "lunch": "12:00-1:00 PM (main meal)", "dinner": "6:00-6:30 PM (light)"},
            "seasonal_tips": ["Eat lighter meals in spring", "Favor pungent, bitter, and astringent tastes", "Skip breakfast if not hungry"]
        }
    }
    
    recommendations = diet_recommendations[prakriti]
    diet_plan_obj = DietPlan(
        user_id=user.id,
        prakriti_type=prakriti,
        **recommendations
    )
    
    await db.diet_plans.insert_one(diet_plan_obj.model_dump())
    return diet_plan_obj.model_dump()

# Daily Schedule Routes
@api_router.get("/daily-schedule")
async def get_daily_schedule(user: User = Depends(get_current_user)):
    profile = await db.user_profiles.find_one({"user_id": user.id})
    if not profile or not profile.get('prakriti_type'):
        raise HTTPException(status_code=400, detail="Please complete Prakriti analysis first")
    
    schedule = await db.daily_schedules.find_one({"user_id": user.id}, {"_id": 0})
    if schedule:
        return schedule
    
    # Generate daily schedule
    prakriti = profile['prakriti_type']
    schedule_recommendations = {
        "Vata": {
            "wake_time": "6:00 AM",
            "sleep_time": "10:00 PM",
            "activities": [
                {"time": "6:00 AM", "activity": "Wake up, drink warm water"},
                {"time": "6:30 AM", "activity": "Oil massage (Abhyanga) with sesame oil"},
                {"time": "7:00 AM", "activity": "Gentle yoga and meditation (20 mins)"},
                {"time": "8:00 AM", "activity": "Warm breakfast"},
                {"time": "12:00 PM", "activity": "Main meal of the day"},
                {"time": "3:00 PM", "activity": "Short walk or light activity"},
                {"time": "6:30 PM", "activity": "Light dinner"},
                {"time": "9:00 PM", "activity": "Relaxation routine, herbal tea"},
                {"time": "10:00 PM", "activity": "Bedtime"}
            ]
        },
        "Pitta": {
            "wake_time": "5:30 AM",
            "sleep_time": "10:30 PM",
            "activities": [
                {"time": "5:30 AM", "activity": "Wake up, drink cool water"},
                {"time": "6:00 AM", "activity": "Coconut oil massage"},
                {"time": "6:30 AM", "activity": "Moderate yoga and breathing exercises"},
                {"time": "8:00 AM", "activity": "Nourishing breakfast"},
                {"time": "12:00 PM", "activity": "Lunch (largest meal)"},
                {"time": "4:00 PM", "activity": "Cooling walk in nature"},
                {"time": "7:00 PM", "activity": "Light dinner"},
                {"time": "9:30 PM", "activity": "Calming activities, avoid screens"},
                {"time": "10:30 PM", "activity": "Bedtime"}
            ]
        },
        "Kapha": {
            "wake_time": "5:00 AM",
            "sleep_time": "10:00 PM",
            "activities": [
                {"time": "5:00 AM", "activity": "Wake up, drink warm ginger water"},
                {"time": "5:30 AM", "activity": "Vigorous exercise or yoga (30-40 mins)"},
                {"time": "7:00 AM", "activity": "Dry brushing and warm shower"},
                {"time": "8:00 AM", "activity": "Light breakfast (optional)"},
                {"time": "12:00 PM", "activity": "Main meal with spices"},
                {"time": "3:00 PM", "activity": "Active movement or brisk walk"},
                {"time": "6:00 PM", "activity": "Very light dinner"},
                {"time": "9:00 PM", "activity": "Light reading or relaxation"},
                {"time": "10:00 PM", "activity": "Bedtime"}
            ]
        }
    }
    
    recommendations = schedule_recommendations[prakriti]
    schedule_obj = DailySchedule(
        user_id=user.id,
        prakriti_type=prakriti,
        **recommendations
    )
    
    await db.daily_schedules.insert_one(schedule_obj.model_dump())
    return schedule_obj.model_dump()

# Follow-up Routes
@api_router.get("/follow-ups")
async def get_follow_ups(user: User = Depends(get_current_user)):
    follow_ups = await db.follow_ups.find({"user_id": user.id}, {"_id": 0}).sort("date", -1).to_list(100)
    return follow_ups

@api_router.post("/follow-ups")
async def create_follow_up(follow_up_data: Dict[str, Any], user: User = Depends(get_current_user)):
    follow_up = FollowUp(
        user_id=user.id,
        date=datetime.fromisoformat(follow_up_data['date']) if 'date' in follow_up_data else datetime.now(timezone.utc),
        notes=follow_up_data.get('notes'),
        progress_rating=follow_up_data.get('progress_rating'),
        feedback=follow_up_data.get('feedback')
    )
    await db.follow_ups.insert_one(follow_up.model_dump())
    return follow_up.model_dump()

# Admin Routes
@api_router.get("/admin/users")
async def get_all_users(user: User = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

@api_router.get("/admin/stats")
async def get_admin_stats(user: User = Depends(get_current_user)):
    total_users = await db.users.count_documents({})
    profiles_completed = await db.user_profiles.count_documents({"prakriti_type": {"$exists": True}})
    total_follow_ups = await db.follow_ups.count_documents({})
    
    # Prakriti distribution
    vata_count = await db.user_profiles.count_documents({"prakriti_type": "Vata"})
    pitta_count = await db.user_profiles.count_documents({"prakriti_type": "Pitta"})
    kapha_count = await db.user_profiles.count_documents({"prakriti_type": "Kapha"})
    
    return {
        "total_users": total_users,
        "profiles_completed": profiles_completed,
        "total_follow_ups": total_follow_ups,
        "prakriti_distribution": {
            "Vata": vata_count,
            "Pitta": pitta_count,
            "Kapha": kapha_count
        }
    }

@api_router.get("/admin/user/{user_id}/details")
async def get_user_details(user_id: str, user: User = Depends(get_current_user)):
    user_data = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
    follow_ups = await db.follow_ups.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).to_list(50)
    
    return {
        "user": user_data,
        "profile": profile,
        "follow_ups": follow_ups
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()