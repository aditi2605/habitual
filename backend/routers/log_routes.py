from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

from database import get_db
from models import User, Habit, HabitLog
from auth import get_current_user


router = APIRouter(tags=["Habit Logging"])


@router.post("/habits/{habit_id}/log")
def log_habit_completion(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    # Find the habit
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).first()
    
    if not habit:
        raise HTTPException(404, "Habit not found")
    
    # Check if already logged today
    today = date.today()
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == current_user.id,
        HabitLog.log_date == today
    ).first()
    
    if existing_log and existing_log.completed:
        raise HTTPException(400, f"Already completed '{habit.name}' today!")
    
    # Check if logged yesterday (for streak)
    yesterday = today - timedelta(days=1)
    logged_yesterday = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == current_user.id,
        HabitLog.log_date == yesterday,
        HabitLog.completed == True
    ).first()
    
    # Update streak
    if logged_yesterday:
        habit.streak_count += 1
    else:
        habit.streak_count = 1
    
    if habit.streak_count > habit.best_streak:
        habit.best_streak = habit.streak_count
    
    # Create log entry
    new_log = HabitLog(
        user_id=current_user.id,
        habit_id=habit_id,
        log_date=today,
        completed=True,
        completed_at=datetime.utcnow()
    )
    
    db.add(new_log)
    db.commit()
    # db.refresh(habit)

    return {
        "message": f"🔥 {habit.streak_count}-day streak!",
        "current_streak": habit.streak_count
    }
    
    # Celebration messages
    # celebration = ""
    # if habit.streak_count == 7:
    #     celebration = "🎉 ONE WEEK STREAK!"
    # elif habit.streak_count == 30:
    #     celebration = "🚀 30 DAYS! Unstoppable!"
    # elif habit.streak_count == 100:
    #     celebration = "👑 100 DAYS! LEGENDARY!"
    
    # return {
    #     "message": f"🔥 {habit.streak_count}-day streak!",
    #     "celebration": celebration,
    #     "habit_name": habit.name,
    #     "current_streak": habit.streak_count,
    #     "best_streak": habit.best_streak
    # }


@router.get("/habits/{habit_id}/logs")
def get_habit_logs(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 30
):
    """Get logging history for a habit"""
    
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(404, "Habit not found")
    
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == current_user.id
    ).order_by(HabitLog.log_date.desc()).limit(limit).all()
    
    return {"logs": logs}