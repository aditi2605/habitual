from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

# user schema
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    created_at: datetime

class Config:
    from_attributes = True 


# Habit Schemas

class HabitCreate(BaseModel):
    name: str
    icon: Optional[str] = "🌱"
    color: Optional[str] = "#6db85c"
    target_time: Optional[str] = None
    frequency: Optional[str] = "daily"
    description: Optional[str] = None

class Habitual(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    target_time: Optional[str] = None
    frequency: Optional[str] = None
    description: Optional[str] = None

class HabitResponse(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    target_time: Optional[str]
    frequency: str
    streak_count: int
    best_streak: int
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# habit log schema

class HabitLogCreate(BaseModel):
    notes: Optional[str] = None

class HabitLogResponse(BaseModel):
    id: int
    habit_id:int
    log_date: date
    completed: bool
    completed_at: Optional[datetime] 
    notes: Optional[str]

    class Config:
        from_attributes: True


# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str
