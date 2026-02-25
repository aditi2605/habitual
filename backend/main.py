from fastapi import FastAPI, Response, Depends
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

# Core configuration

def is_allowed_origin(origin: str) -> bool:
    """Check if origin is allowed"""
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    
    # Allow exact matches
    if origin in allowed_origins:
        return True
    
    # Allow all *.vercel.app domains
    if re.match(r"https://.*\.vercel\.app$", origin):
        return True
    
    return False

@app.middleware("http")
async def cors_middleware(request, call_next):
    origin = request.headers.get("origin")
    
    # Handle preflight OPTIONS requests
    if request.method == "OPTIONS":
        if origin and is_allowed_origin(origin):
            response = Response(status_code=200)
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Max-Age"] = "600"
            return response
        return Response(status_code=403)
    
    # Handle actual requests
    response = await call_next(request)
    
    if origin and is_allowed_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# Standard CORS middleware as backup
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(habit_router, prefix="/habits", tags=["Habits"])
app.include_router(log_router, prefix="/logs", tags=["Logs"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(competition_router, prefix="/competitions", tags=["Competitions"])
app.include_router(notification_router, prefix="/notifications", tags=["Notifications"])

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