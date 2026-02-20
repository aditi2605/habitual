from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

# Import from our own files
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token
from auth import hash_password, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES


# CREATE THE ROUTER

# APIRouter groups related endpoints together
# prefix="/auth" means all routes start with /auth
# tags=["Authentication"] groups them in the docs
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Signup (Register new user)
@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(
    user_data: UserCreate, 
    db: Session = Depends(get_db)  
):
    
    #Check if email already exists 
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    
    if existing_user:
        # If email exists, reject the request
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please use a different email or login."
        )
    
    # Hash the password ─
    hashed_pwd = hash_password(user_data.password)
    
    # Create new user
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=hashed_pwd  # Store hashed version only!
    )
    
    # Add to database
    db.add(new_user)
    db.commit()  
    db.refresh(new_user)  
    
    # Generate JWT token 
    access_token = create_access_token(
        data={"sub": new_user.email},  
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Return token 
    return {
        "access_token": access_token,
        "token_type": "bearer"  
    }


# LOGIN (Authenticate existing user)


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin, 
    db: Session = Depends(get_db)
):
    
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        # if User doesn't exist
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password" 
        )
    
    # Verify password

    password_correct = verify_password(credentials.password, user.hashed_password)
    
    if not password_correct:
        # if Wrong password
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Generate JWT token 
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    #  Return token 
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# (Test if logged in)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    
    return current_user