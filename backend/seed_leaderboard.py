# backend/seed_leaderboard.py
from database import SessionLocal
from models import User, Habit, HabitLog
from auth import hash_password
from datetime import date, timedelta
import random

db = SessionLocal()

# Create dummy users
dummy_users = [
    {"first_name": "Alex", "last_name": "Smith", "email": "alex@demo.com"},
    {"first_name": "Maria", "last_name": "Garcia", "email": "maria@demo.com"},
    {"first_name": "John", "last_name": "Doe", "email": "john@demo.com"},
    {"first_name": "Emma", "last_name": "Wilson", "email": "emma@demo.com"},
    {"first_name": "Michael", "last_name": "Brown", "email": "michael@demo.com"},
]

for user_data in dummy_users:
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data["email"]).first()
    if existing:
        continue
    
    user = User(
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        email=user_data["email"],
        hashed_password=hash_password("demo123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create habits with random streaks
    for i in range(3):
        habit = Habit(
            user_id=user.id,
            name=f"Habit {i+1}",
            icon="🔥",
            streak_count=random.randint(5, 50),
            best_streak=random.randint(50, 100),
        )
        db.add(habit)
    
    db.commit()

print("Seeded 5 demo users with habits!")
db.close()