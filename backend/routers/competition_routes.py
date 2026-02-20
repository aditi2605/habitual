from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, datetime, timedelta
from typing import List

from database import get_db
from models import User, Habit, HabitLog
from auth import get_current_user

router = APIRouter(
    prefix="/competitions",
    tags=["Competitions & Leaderboard"]
)


# created "virtual competitions" based on existing data


@router.get("/active")
def get_active_competitions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    
    today = date.today()
    
    competitions = [
        {
            "id": "longest_streak",
            "title": "🔥 Longest Streak Battle",
            "description": "Who has the longest CURRENT streak across all habits?",
            "prize": "Bragging rights + Streak King/Queen badge",
            "type": "ongoing",
            "ends": None
        },
        {
            "id": "monthly_champion",
            "title": "📅 Monthly Completion Champion",
            "description": "Most habits completed this month wins!",
            "prize": "Monthly Champion badge",
            "type": "monthly",
            "ends": (today.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        },
        {
            "id": "perfect_week",
            "title": "💯 Perfect Week Challenge",
            "description": "Complete ALL habits for 7 days straight",
            "prize": "Perfect Week badge",
            "type": "ongoing",
            "ends": None
        },
        {
            "id": "hundred_club",
            "title": "💎 100-Day Club",
            "description": "Reach a 100-day streak on ANY habit",
            "prize": "Diamond badge + Legendary status",
            "type": "milestone",
            "ends": None
        }
    ]
    
    return {
        "active_competitions": competitions,
        "user_status": {
            "participating_in": 4, 
            "message": "You're competing in all challenges! Keep going! 🚀"
        }
    }

# Show top performers for a specific competition.
@router.get("/leaderboard/{competition_id}")
def get_competition_leaderboard(
    competition_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    
    leaderboard = []
    current_user_entry = None
    
    #  longest streak compitition───
    if competition_id == "longest_streak":
        # Find the longest single streak across all users
        # Group by user, get their max streak
        
        results = db.query(
            User.id,
            User.first_name,
            User.last_name,
            func.max(Habit.streak_count).label('max_streak'),
            Habit.name.label('habit_name')
        ).join(Habit, User.id == Habit.user_id).filter(
            Habit.is_active == True,
            Habit.streak_count > 0
        ).group_by(User.id).order_by(desc('max_streak')).limit(limit).all()
        
        rank = 1
        for r in results:
            entry = {
                "rank": rank,
                "user": f"{r.first_name} {r.last_name[0]}.",  # Privacy: "Alex S."
                "score": r.max_streak,
                "metric": "days",
                "habit": r.habit_name,
                "is_you": r.id == current_user.id
            }
            leaderboard.append(entry)
            
            if r.id == current_user.id:
                current_user_entry = entry
            
            rank += 1
        
        title = "🔥 Longest Streak Leaderboard"
        description = "Current streak on any habit"
    
    # monthly completion
    elif competition_id == "monthly_champion":
        # Count total completions this month per user
        first_day = date.today().replace(day=1)
        
        results = db.query(
            User.id,
            User.first_name,
            User.last_name,
            func.count(HabitLog.id).label('completions')
        ).join(HabitLog, User.id == HabitLog.user_id).filter(
            HabitLog.log_date >= first_day,
            HabitLog.completed == True
        ).group_by(User.id).order_by(desc('completions')).limit(limit).all()
        
        rank = 1
        for r in results:
            entry = {
                "rank": rank,
                "user": f"{r.first_name} {r.last_name[0]}.",
                "score": r.completions,
                "metric": "completions",
                "is_you": r.id == current_user.id
            }
            leaderboard.append(entry)
            
            if r.id == current_user.id:
                current_user_entry = entry
            
            rank += 1
        
        title = "📅 Monthly Champion Leaderboard"
        description = "Total habits completed this month"
    
    #100day club
    elif competition_id == "hundred_club":
        # Users who've hit 100+ day streak
        results = db.query(
            User.id,
            User.first_name,
            User.last_name,
            Habit.best_streak,
            Habit.name
        ).join(Habit, User.id == Habit.user_id).filter(
            Habit.best_streak >= 100
        ).order_by(desc(Habit.best_streak)).limit(limit).all()
        
        rank = 1
        for r in results:
            entry = {
                "rank": rank,
                "user": f"{r.first_name} {r.last_name[0]}.",
                "score": r.best_streak,
                "metric": "days",
                "habit": r.name,
                "is_you": r.id == current_user.id,
                "badge": "💎"
            }
            leaderboard.append(entry)
            
            if r.id == current_user.id:
                current_user_entry = entry
            
            rank += 1
        
        title = "💎 100-Day Club (Legends Only)"
        description = "Users who reached 100+ day streaks"
    
    else:
        raise HTTPException(404, "Competition not found")
    
    # If current user isn't in top 10, find their rank
    if not current_user_entry:
        # Calculate their actual rank and score
        current_user_entry = {
            "rank": "11+",
            "user": "You",
            "score": 0,
            "is_you": True,
            "message": "Keep going to break into the top 10!"
        }
    
    return {
        "competition": {
            "id": competition_id,
            "title": title,
            "description": description
        },
        "leaderboard": leaderboard,
        "your_position": current_user_entry,
        "motivation": get_motivation_message(current_user_entry.get("rank", 999))
    }


def get_motivation_message(rank):
    """encouraging messages based on rank"""
    if rank == 1:
        return "👑 YOU'RE #1! Defend your throne!"
    elif rank <= 3:
        return "🥈 So close to #1! You got this!"
    elif rank <= 10:
        return "🔥 Top 10! Keep pushing!"
    else:
        return "💪 Keep grinding! You'll break into the top soon!"

#  Show user's badges and achievements
@router.get("/my-achievements")
def get_my_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    badges = []
    
    # Check what they've earned
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id
    ).all()
    
    if len(habits) > 0:
        badges.append({
            "id": "first_habit",
            "name": "Getting Started",
            "icon": "🌱",
            "description": "Created your first habit",
            "earned": True
        })
    
    # Check for streak badges
    max_streak = max([h.streak_count for h in habits]) if habits else 0
    
    if max_streak >= 7:
        badges.append({
            "id": "week_warrior",
            "name": "Week Warrior",
            "icon": "🔥",
            "description": "7-day streak achieved",
            "earned": True
        })
    
    if max_streak >= 30:
        badges.append({
            "id": "monthly_master",
            "name": "Monthly Master",
            "icon": "💪",
            "description": "30-day streak achieved",
            "earned": True
        })
    
    if max_streak >= 100:
        badges.append({
            "id": "century_club",
            "name": "Century Club",
            "icon": "💎",
            "description": "100-day streak achieved",
            "earned": True
        })
    
    # Total completions
    total_completions = db.query(HabitLog).filter(
        HabitLog.user_id == current_user.id,
        HabitLog.completed == True
    ).count()
    
    if total_completions >= 100:
        badges.append({
            "id": "hundred_completions",
            "name": "Habit Champion",
            "icon": "🏆",
            "description": "100 total completions",
            "earned": True
        })
    
    return {
        "total_badges": len(badges),
        "badges": badges,
        "next_badge": "Keep going for more achievements! 🚀"
    }