from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Habit
from schemas import HabitCreate,  Habitual, HabitResponse
from auth import get_current_user

# Create the router

router = APIRouter(
    prefix="/habits",
    tags=["Habits"]
)



# Create a new habit
@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(
    habit_data: HabitCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)  
):
    
    # Validate habit name 
    if not habit_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Habit name cannot be empty"
        )
    
    if len(habit_data.name) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Habit name too long (max 100 characters)"
        )
    
    # Create the habit 
    new_habit = Habit(
        user_id=current_user.id,  
        name=habit_data.name,
        icon=habit_data.icon or "🌱", 
        color=habit_data.color or "#6db85c",
        target_time=habit_data.target_time,
        frequency=habit_data.frequency or "daily",
        description=habit_data.description,
        streak_count=0, 
        best_streak=0,
        is_active=True 
    )
    
    # Save to database
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)   
    return new_habit



# get all user's habit
@router.get("/", response_model=List[HabitResponse])
def get_all_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    # Get all user's active habits
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True  
    ).order_by(Habit.created_at.desc()).all() 
    
    # Return them 
    return habits


# get a habit by ID
@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit_by_id(
    habit_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # 1.Find the habit
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id  
    ).first()
    
    # 2.Check if found 
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found or you don't have permission to view it"
        )
    
    # 3.Return it 
    return habit



# update a habit
@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,  
    habit_data: Habitual, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    # 1.Find the habit
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    # 2.Check if found 
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found or you don't have permission to update it"
        )
    
    # 3.Update only provided fields
    update_data = habit_data.dict(exclude_unset=True)
    
    # Update each field if it was provided
    for field, value in update_data.items():
        setattr(habit, field, value)  
    
    #4.Validate name if it was updated 
    if "name" in update_data:
        if not habit.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Habit name cannot be empty"
            )
        if len(habit.name) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Habit name too long (max 100 characters)"
            )
    
    # Save changes
    db.commit()
    db.refresh(habit)
    
    # Return updated habit 
    return habit



# delete a habit(Soft Delete)

@router.delete("/{habit_id}", status_code=status.HTTP_200_OK)
def delete_habit(
    habit_id: int,  
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    
    # Find the habit 
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    # Check if found 
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found or you don't have permission to delete it"
        )
    
    #  Soft delete ───
    # We set is_active to False instead of actually deleting
    # This keeps the data for analytics/history
    habit.is_active = False
    
    db.commit()
    
    #  Return success message 
    return {
        "message": f"Habit '{habit.name}' deleted successfully",
        "habit_id": habit.id
    }