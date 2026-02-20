from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

from database import get_db
from models import User, Habit, HabitLog, Notification
from auth import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

# Get user's notifications.
@router.get("/")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    unread_only: bool = False
):

    query = db.query(Notification).filter(
        Notification.user_id == current_user.id
    )
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(
        Notification.created_at.desc()
    ).limit(20).all()
    
    return {
        "unread_count": db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).count(),
        "notifications": [
            {
                "id": n.id,
                "message": n.message,
                "type": n.notification_type,
                "is_read": n.is_read,
                "created_at": n.created_at
            }
            for n in notifications
        ]
    }


# Mark notification as read
@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(404, "Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

# Generate notifications for incomplete habits
@router.post("/generate-daily")
def generate_daily_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    today = date.today()
    
    # Get all habits not completed today
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    
    notifications_created = 0
    
    for habit in habits:
        # Check if logged today
        log_today = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.log_date == today,
            HabitLog.completed == True
        ).first()
        
        if not log_today:
            # Create reminder notification
            notification = Notification(
                user_id=current_user.id,
                message=f"⏰ Don't forget: {habit.name} ({habit.target_time or 'today'})",
                notification_type="reminder"
            )
            db.add(notification)
            notifications_created += 1
    
    db.commit()
    
    return {
        "message": f"Created {notifications_created} reminder(s)",
        "notifications_created": notifications_created
    }