from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
import re

from routers.auth_routes import router as auth_router
from routers.habit_routes import router as habit_router
from routers.log_routes import router as log_router
from routers.analytics_routes import router as analytics_router
from routers.competition_routes import router as competition_router
from routers.notification_routes import router as notification_router

from database import get_db
from models import Habit, HabitLog, User
from auth import get_current_user


# create FASTAPI app
app = FastAPI(
    title="Habitual ",
    description="Habit tracking app",
    version="2.0.0"
)


# Custom CORS middleware that allows Vercel subdomains
@app.middleware("http")
async def custom_cors_middleware(request, call_next):
    origin = request.headers.get("origin")
    
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://habitual-pi.vercel.app",
    ]
    
    # Allow all *.vercel.app domains
    if origin and (origin in allowed_origins or re.match(r"https://.*\.vercel\.app", origin)):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    
    return await call_next(request)
# cors middleware(Allow React frontend to connect)
# This allows your React app (running on localhost:3000) 
# to make requests to this API (running on localhost:8000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",  "http://localhost:3000", "https://habitual-git-main-aditi2605s-projects.vercel.app", "https://habitual-f2petkwde-aditi2605s-projects.vercel.app"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# include routes(login, signup, habits(create, update, delete))
app.include_router(auth_router)
app.include_router(habit_router)
app.include_router(log_router)
app.include_router(analytics_router)
app.include_router(competition_router)
app.include_router(notification_router)


# daily habit status
@app.get("/habits/today/status")
def get_today_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get completion status for all habits TODAY"""
    today = date.today()
    
    # Get all active habits
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    
    habits_status = []
    completed_count = 0
    
    for habit in habits:
        log_today = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.log_date == today,
            HabitLog.completed == True
        ).first()
        
        is_done = log_today is not None
        if is_done:
            completed_count += 1
        
        habits_status.append({
            "id": habit.id,
            "name": habit.name,
            "icon": habit.icon,
            "color": habit.color,
            "target_time": habit.target_time,
            "completed_today": is_done,
            "completed_at": log_today.completed_at.strftime("%I:%M %p") if log_today else None,
            "current_streak": habit.streak_count,
            "best_streak": habit.best_streak
        })
    
    total = len(habits)
    completion_pct = round((completed_count / total * 100)) if total > 0 else 0
    
    return {
        "date": today.strftime("%A, %B %d, %Y"),
        "total_habits": total,
        "completed": completed_count,
        "remaining": total - completed_count,
        "completion_percentage": completion_pct,
        "habits": habits_status
    }

#  server is running
@app.get("/")
def root():
    return {
        "message": "API is running!",
        "docs": "http://localhost:8000/docs",
        "features": [
            "Authentication with JWT",
            "Habit tracking with streaks",
            "Weekly & monthly analytics",
            "Live competitions & leaderboards",
            "Achievements & badges",
            "Smart notifications"
        ]
    }