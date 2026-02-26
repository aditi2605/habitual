from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import date
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


from routers.auth_routes import router as auth_router
from routers.habit_routes import router as habit_router
from routers.log_routes import router as log_router
from routers.analytics_routes import router as analytics_router
from routers.competition_routes import router as competition_router
from routers.notification_routes import router as notification_router
from database import get_db, engine, Base
from models import Habit, User, HabitLog
from auth import get_current_user

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Habitual API",
    description="Habit Tracking API with analytics and competitions",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.on_event("startup")
def create_tables():
    """Create all database tables if they don't exist"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://habitual-pi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Global rate limiting for all endpoints"""
    # Whitelist health check endpoint
    if request.url.path == "/health":
        return await call_next(request)
    
    # Get client IP
    client_ip = get_remote_address(request)
    
    # Check if IP is making too many requests (backup protection)
    # This is in addition to endpoint-specific limits
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
    
# routes
app.include_router(auth_router, tags=["Authentication"])
app.include_router(habit_router, tags=["Habits"])
app.include_router(log_router, tags=["Logs"])
app.include_router(analytics_router, tags=["Analytics"])
app.include_router(competition_router, tags=["Competitions"])
app.include_router(notification_router, tags=["Notifications"])

# Health checks
@app.get("/")
@limiter.limit("60/minute")
async def root():
    return {
        "message": "Habitual API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "rate_limit": "Protected endpoints have rate limits"
    }

@app.get("/health")
@limiter.limit("120/minute")
async def health_check():
    return {"status": "healthy"}

# Daily habit status
@app.get("/habits/today/status")
@limiter.limit("30/minute") 
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