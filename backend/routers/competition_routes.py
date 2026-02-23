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
    
    try:
        # LONGEST STREAK COMPETITION 
        if competition_id == "longest_streak":
            # Get all users with active habits
            users_with_habits = db.query(User).join(Habit).filter(
                Habit.is_active == True,
                Habit.streak_count > 0
            ).distinct().all()
            
            # Create leaderboard from users
            user_streaks = []
            for user in users_with_habits:
                max_habit = db.query(Habit).filter(
                    Habit.user_id == user.id,
                    Habit.is_active == True
                ).order_by(Habit.streak_count.desc()).first()
                
                if max_habit:
                    user_streaks.append({
                        'user_id': user.id,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'streak': max_habit.streak_count,
                        'habit_name': max_habit.name
                    })
            
            # Sort by streak
            user_streaks.sort(key=lambda x: x['streak'], reverse=True)
            
            # Build leaderboard
            for rank, entry in enumerate(user_streaks[:limit], 1):
                leaderboard_entry = {
                    "rank": rank,
                    "user": f"{entry['first_name']} {entry['last_name'][0]}.",
                    "score": entry['streak'],
                    "metric": "days",
                    "habit": entry['habit_name'],
                    "is_you": entry['user_id'] == current_user.id
                }
                leaderboard.append(leaderboard_entry)
                
                if entry['user_id'] == current_user.id:
                    current_user_entry = leaderboard_entry
            
            title = "🔥 Longest Streak Leaderboard"
            description = "Current streak on any habit"
        
        # MONTHLY COMPLETIONS
        elif competition_id == "monthly_champion":
            from datetime import date
            first_day = date.today().replace(day=1)
            
            # Get completion counts
            users_with_logs = db.query(User).join(HabitLog).filter(
                HabitLog.log_date >= first_day,
                HabitLog.completed == True
            ).distinct().all()
            
            user_completions = []
            for user in users_with_logs:
                count = db.query(HabitLog).filter(
                    HabitLog.user_id == user.id,
                    HabitLog.log_date >= first_day,
                    HabitLog.completed == True
                ).count()
                
                user_completions.append({
                    'user_id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'completions': count
                })
            
            user_completions.sort(key=lambda x: x['completions'], reverse=True)
            
            for rank, entry in enumerate(user_completions[:limit], 1):
                leaderboard_entry = {
                    "rank": rank,
                    "user": f"{entry['first_name']} {entry['last_name'][0]}.",
                    "score": entry['completions'],
                    "metric": "completions",
                    "is_you": entry['user_id'] == current_user.id
                }
                leaderboard.append(leaderboard_entry)
                
                if entry['user_id'] == current_user.id:
                    current_user_entry = leaderboard_entry
            
            title = "📅 Monthly Champion Leaderboard"
            description = "Total habits completed this month"
        
        else:
            raise HTTPException(404, "Competition not found")
        
        # If current user isn't in top 10
        if not current_user_entry and len(leaderboard) > 0:
            current_user_entry = {
                "rank": "11+",
                "user": "You",
                "score": 0,
                "is_you": True,
                "message": "Keep going to break into the top 10!"
            }
        
        # If no one is on leaderboard yet
        if len(leaderboard) == 0:
            leaderboard = [{
                "rank": 1,
                "user": f"{current_user.first_name} {current_user.last_name[0]}.",
                "score": 0,
                "metric": "days" if competition_id == "longest_streak" else "completions",
                "is_you": True
            }]
            current_user_entry = leaderboard[0]
        
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
    
    except Exception as e:
        print(f"Error loading leaderboard: {e}")
        # Return empty leaderboard instead of crashing
        return {
            "competition": {
                "id": competition_id,
                "title": "Competition Leaderboard",
                "description": "Loading..."
            },
            "leaderboard": [],
            "your_position": None,
            "motivation": "Start logging habits to join the leaderboard!"
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