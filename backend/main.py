from fastapi import FastAPI, Response, Depends, Request
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
from models import Habit, User, HabitLog
from auth import get_current_user

app = FastAPI(
    title="Habitual API",
    description="Habit Tracking API with analytics and competitions",
    version="1.0.0"
)

# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app$", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Also allow localhost for development
@app.middleware("http")
async def add_localhost_cors(request: Request, call_next):
    origin = request.headers.get("origin")
    
    if origin and (origin.startswith("http://localhost:") or origin.startswith("https://.*\.vercel\.app")):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    return await call_next(request)

# ==================== ROUTES ====================

app.include_router(auth_router, tags=["Authentication"])
app.include_router(habit_router, tags=["Habits"])
app.include_router(log_router, tags=["Logs"])
app.include_router(analytics_router, tags=["Analytics"])
app.include_router(competition_router, tags=["Competitions"])
app.include_router(notification_router, tags=["Notifications"])

# Health checks
@app.get("/")
async def root():
    return {
        "message": "Habitual API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Daily habit status
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