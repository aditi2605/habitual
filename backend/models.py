from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # relationships
    habits = relationship("Habit", back_populates="user")
    habit_logs = relationship("HabitLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    icon = Column(String, default="🌱")
    description = Column(String, nullable=True)
    frequency = Column(String, default="daily")
    target_time = Column(String, nullable=True)
    color = Column(String, default="#6db85c")
    streak_count = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # relationships
    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit")


class HabitLog(Base):
    __tablename__ = "habit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    
    # relationships
    user = relationship("User", back_populates="habit_logs")
    habit = relationship("Habit", back_populates="logs")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(String, default="reminder")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # relationships
    user = relationship("User", back_populates="notifications")

# virtual competitions model
class Competition(Base):
    __tablename__ = "competitions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    competition_type = Column(String)  # "longest_streak", "most_completions", "30_day_challenge"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CompetitionEntry(Base):
    __tablename__ = "competition_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=True)
    score = Column(Integer, default=0)  # Their achievement (streak days, completions, etc)
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow)