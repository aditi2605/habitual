from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import List
from database import get_db
from models import User, Habit, HabitLog
from schemas import HabitLogCreate, HabitResponse, HabitLogResponse
from auth import get_current_user

router = APIRouter(
    prefix="/habit",
    tags=["Habit Logging"]
)

@router.post("/{habit_id}/log", response_model=dict)
def log_habit_completion(
    habit_id: int,
    log_date: HabitLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id ==habit_id,
        Habit.user_id == current_user.od,
        Habit.is_active == True
    ).first()

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found or you don't have permission"
        )
    
    today = date.today()

    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == current_user.id,
        HabitLog.log_date == today
    ).first()

    yesterday = today - timedelta(day=1)

    logged_yesterday = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == current_user.id,
        HabitLog.log_date == yesterday,
        HabitLog.completed == True
    ).first()


    if logged_yesterday:
        habit.streak_count += 1
        streak_message = f"Streak continue! You are on fire! 🔥"
    else:
        habit.streak_count = 1
        streak_message = f"New streak stared! Keep going! 💪🏻"

    new_log = HabitLog(
        user_id=current_user.id,
        habit_id=habit_id,
        log_date=today,
        completed=True,
        completed_at=datetime.utcnow(),
        notes=log_data.notes if log_data else None

    )

    db.add(new_log)
    db.commit()
    db.refresh(habit)

    celebration = ""

    if habit.streak_count == 7:
        celebration = "🎉 ONE WEEK STREAK! Amazing!"
    elif habit.streak_count == 30:
        celebration = "🚀 30 DAYS! You're unstoppable!"
    elif habit.streak_count == 100:
        celebration = "👑 100 DAYS! You're unstoppable!"
    elif habit.streak_count % 10 == 0:
        celebration = f"💪🏻 {habit.streak_count} days strong!"

    return {
        "message": streak_message,
        "celebration": celebration,
        "habit_name": habit.name,
        "current_streak": habit.streak_count,
        "best_streak": habit.best_streak,
        "completed_at": new_log.completed_at.strftime("%I:%M %p"),
        "total_completions": db.query(HabitLog).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.completed == True
        ).count()
    }

# user habit history

@router.get("/{habit_id}/logs", response_model=List[HabitLogResponse])
def get_habit_logs(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 30  
):
  
    # Security check
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Get logs
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == current_user.id
    ).order_by(HabitLog.log_date.desc()).limit(limit).all()
    
    return logs


# daily dashboard status
@router.get("/today/status", response_model=dict)
def get_today_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    today = date.today()
    
    # Get all active habits
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    
    # For each habit, check if completed today
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

