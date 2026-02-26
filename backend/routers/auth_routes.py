from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse 
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import httpx

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
        hashed_password=hashed_pwd  
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
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        print("LOGIN HIT")
        print("Incoming:", credentials)

        user = db.query(User).filter(User.email == credentials.email).first()
        print("User found:", user)

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )

        print("Stored hash:", user.hashed_password)

        password_correct = verify_password(credentials.password, user.hashed_password)
        print("Password match:", password_correct)

        if not password_correct:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )

        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# (Test if logged in)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    
    return current_user

# google Oauth
@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth flow"""
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://habitual-api-sx0c.onrender.com/auth/google/callback")
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={google_client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid email profile&"
        f"access_type=offline"
    )
    
    return {"auth_url": auth_url}

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # Exchange code for access token
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://habitual-api-sx0c.onrender.com/auth/google/callback")
        
        async with httpx.AsyncClient() as client:
            # Get access token
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": google_client_id,
                    "client_secret": google_client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }
            )
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            # Get user info
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            user_info = user_response.json()
        
        # Check if user exists
        user = db.query(User).filter(User.email == user_info["email"]).first()
        
        if not user:
            # Create new user from Google data
            user = User(
                email=user_info["email"],
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
                hashed_password=hash_password(os.urandom(32).hex())
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate JWT token
        jwt_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Redirect to frontend with token
        frontend_url = os.getenv("FRONTEND_URL", "https://habitual-pi.vercel.app")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={jwt_token}")
        
    except Exception as e:
        print(f"Google OAuth error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")


# facebook OAuth

# @router.get("/facebook/login")
# async def facebook_login():
#     """Initiate Facebook OAuth flow"""
#     facebook_app_id = os.getenv("FACEBOOK_APP_ID")
#     redirect_uri = os.getenv("FACEBOOK_REDIRECT_URI", "https://habitual-api-sx0c.onrender.com/auth/facebook/callback")
    
#     auth_url = (
#         f"https://www.facebook.com/v12.0/dialog/oauth?"
#         f"client_id={facebook_app_id}&"
#         f"redirect_uri={redirect_uri}&"
#         f"scope=email,public_profile"
#     )
    
#     return {"auth_url": auth_url}

# @router.get("/facebook/callback")
# async def facebook_callback(code: str, db: Session = Depends(get_db)):
    """Handle Facebook OAuth callback"""
    try:
        facebook_app_id = os.getenv("FACEBOOK_APP_ID")
        facebook_app_secret = os.getenv("FACEBOOK_APP_SECRET")
        redirect_uri = os.getenv("FACEBOOK_REDIRECT_URI", "https://habitual-api-sx0c.onrender.com/auth/facebook/callback")
        
        async with httpx.AsyncClient() as client:
            # Exchange code for access token
            token_response = await client.get(
                f"https://graph.facebook.com/v12.0/oauth/access_token?"
                f"client_id={facebook_app_id}&"
                f"client_secret={facebook_app_secret}&"
                f"redirect_uri={redirect_uri}&"
                f"code={code}"
            )
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            # Get user info
            user_response = await client.get(
                f"https://graph.facebook.com/me?"
                f"fields=id,name,email,first_name,last_name&"
                f"access_token={access_token}"
            )
            user_info = user_response.json()
        
        if not user_info.get("email"):
            raise HTTPException(status_code=400, detail="Email not provided by Facebook")
        
        # Check if user exists
        user = db.query(User).filter(User.email == user_info["email"]).first()
        
        if not user:
            # Create new user
            user = User(
                email=user_info["email"],
                first_name=user_info.get("first_name", ""),
                last_name=user_info.get("last_name", ""),
                hashed_password=hash_password(os.urandom(32).hex())
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate JWT token
        jwt_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Redirect to frontend
        frontend_url = os.getenv("FRONTEND_URL", "https://habitual-pi.vercel.app")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={jwt_token}")
        
    except Exception as e:
        print(f"Facebook OAuth error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Facebook authentication failed: {str(e)}")