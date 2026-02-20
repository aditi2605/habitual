from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date, timedelta
from typing import List, Dict
from database import get_db
from models import User, Habit, HabitLog
from auth import get_current_user

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

# weekly analytics
@router.get("/weekly")
def get_weekly_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    
    today = date.today()
    days_data = []
    total_completion = 0
    
    # Get all active habits
    total_habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).count()
    
    if total_habits == 0:
        return {
            "message": "No habits yet! Create some habits to see analytics.",
            "days": []
        }
    
    # Loop through last 7 days
    for i in range(6, -1, -1):  # 6 days ago to today
        day = today - timedelta(days=i)
        
        # Count completed habits on this day
        completed = db.query(HabitLog).filter(
            HabitLog.user_id == current_user.id,
            HabitLog.log_date == day,
            HabitLog.completed == True
        ).count()
        
        completion_pct = round((completed / total_habits * 100)) if total_habits > 0 else 0
        total_completion += completion_pct
        
        days_data.append({
            "date": day.strftime("%Y-%m-%d"),
            "day_name": day.strftime("%A"),
            "day_short": day.strftime("%a"),  # Mon, Tue, Wed
            "completed": completed,
            "total": total_habits,
            "completion_percentage": completion_pct
        })
    
    # Find best and worst days
    best_day = max(days_data, key=lambda x: x["completion_percentage"])
    worst_day = min(days_data, key=lambda x: x["completion_percentage"])
    
    weekly_avg = round(total_completion / 7)
    
    # Generate insight
    insight = ""
    if best_day["completion_percentage"] == 100:
        insight = f"🌟 Perfect {best_day['day_name']}! You completed everything!"
    elif worst_day["completion_percentage"] == 0:
        insight = f"⚠️ {worst_day['day_name']} needs work - you didn't complete any habits."
    elif best_day["completion_percentage"] - worst_day["completion_percentage"] > 50:
        insight = f"📊 Huge gap: {best_day['day_name']} ({best_day['completion_percentage']}%) vs {worst_day['day_name']} ({worst_day['completion_percentage']}%)"
    else:
        insight = f"💪 Consistent week! Average {weekly_avg}% completion."
    
    return {
        "period": "Last 7 days",
        "weekly_average": weekly_avg,
        "best_day": {
            "day": best_day["day_name"],
            "percentage": best_day["completion_percentage"]
        },
        "worst_day": {
            "day": worst_day["day_name"],
            "percentage": worst_day["completion_percentage"]
        },
        "insight": insight,
        "days": days_data
    }

# monthly analytics
@router.get("/monthly")
def get_monthly_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    
    # Get all logs in last 30 days
    logs = db.query(HabitLog).filter(
        HabitLog.user_id == current_user.id,
        HabitLog.log_date >= thirty_days_ago,
        HabitLog.completed == True
    ).all()
    
    total_completions = len(logs)
    
    # Get total possible completions (habits × days)
    total_habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).count()
    
    possible_completions = total_habits * 30
    overall_pct = round((total_completions / possible_completions * 100)) if possible_completions > 0 else 0
    
    # Break down by weeks
    weeks = []
    for week_num in range(4):
        week_start = today - timedelta(days=(3 - week_num) * 7 + 6)
        week_end = week_start + timedelta(days=6)
        
        week_logs = [log for log in logs if week_start <= log.log_date <= week_end]
        week_completions = len(week_logs)
        week_possible = total_habits * 7
        week_pct = round((week_completions / week_possible * 100)) if week_possible > 0 else 0
        
        weeks.append({
            "week": f"Week {week_num + 1}",
            "start_date": week_start.strftime("%b %d"),
            "end_date": week_end.strftime("%b %d"),
            "completions": week_completions,
            "completion_percentage": week_pct
        })
    
    # Calculate trend
    if len(weeks) >= 2:
        first_week = weeks[0]["completion_percentage"]
        last_week = weeks[-1]["completion_percentage"]
        
        if last_week > first_week + 10:
            trend = "📈 Improving! You're getting better!"
        elif last_week < first_week - 10:
            trend = "📉 Declining. Time to refocus!"
        else:
            trend = "➡️ Stable. Keep the consistency!"
    else:
        trend = "New user - keep tracking!"
    
    return {
        "period": "Last 30 days",
        "total_completions": total_completions,
        "possible_completions": possible_completions,
        "overall_percentage": overall_pct,
        "trend": trend,
        "weeks": weeks
    }

# overall performance analytics
@router.get("/habits/performance")
def get_habits_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    
    if not habits:
        return {"message": "No habits to analyze yet"}
    
    # Calculate stats for each habit
    habits_stats = []
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    
    for habit in habits:
        # Count logs in last 30 days
        total_logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.log_date >= thirty_days_ago,
            HabitLog.completed == True
        ).count()
        
        # Calculate completion rate (out of 30 days)
        completion_rate = round((total_logs / 30 * 100))
        
        # Determine status
        if completion_rate >= 80:
            status = "🔥 Crushing it!"
            color = "#6db85c"
        elif completion_rate >= 50:
            status = "💪 Doing well"
            color = "#e8c46a"
        else:
            status = "⚠️ Struggling"
            color = "#e87a6a"
        
        habits_stats.append({
            "habit_id": habit.id,
            "name": habit.name,
            "icon": habit.icon,
            "completion_rate": completion_rate,
            "completions_last_30_days": total_logs,
            "current_streak": habit.streak_count,
            "best_streak": habit.best_streak,
            "status": status,
            "color": color
        })
    
    # Sort by completion rate (best first)
    habits_stats.sort(key=lambda x: x["completion_rate"], reverse=True)
    
    # Find struggling habits
    struggling = [h for h in habits_stats if h["completion_rate"] < 50]
    
    # Generate insights
    insights = []
    
    if len(struggling) > 0:
        insights.append({
            "type": "warning",
            "message": f"You have {len(struggling)} struggling habit(s). Consider:"
        })
        for h in struggling[:2]:  # Top 2 struggling habits
            insights.append({
                "type": "suggestion",
                "message": f"• {h['name']} - Try moving to a different time of day?"
            })
    
    if len(habits_stats) > 0 and habits_stats[0]["completion_rate"] == 100:
        insights.append({
            "type": "celebration",
            "message": f"🏆 {habits_stats[0]['name']} has 100% completion! Legend!"
        })
    
    return {
        "total_habits": len(habits),
        "best_habit": habits_stats[0] if habits_stats else None,
        "struggling_count": len(struggling),
        "habits": habits_stats,
        "insights": insights
    }

# count total streaks
@router.get("/streaks")
def get_all_streaks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    
    streaks = []
    total_streak_days = 0
    longest_streak = 0
    longest_habit = None
    
    for habit in habits:
        if habit.streak_count > 0:
            streaks.append({
                "habit": habit.name,
                "icon": habit.icon,
                "current_streak": habit.streak_count,
                "best_streak": habit.best_streak
            })
            total_streak_days += habit.streak_count
            
            if habit.streak_count > longest_streak:
                longest_streak = habit.streak_count
                longest_habit = habit.name
    
    return {
        "active_streaks": len(streaks),
        "total_streak_days": total_streak_days,
        "longest_current_streak": {
            "habit": longest_habit,
            "days": longest_streak
        } if longest_habit else None,
        "streaks": streaks
    }