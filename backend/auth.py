from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from database import get_db
from models import User

load_dotenv()

# configuration
# This is the secret key used to sign JWT tokens
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")

# Algorithm used to sign the JWT
ALGORITHM = "HS256"

# Token expires after 7 days
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
   
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
   
    return pwd_context.verify(plain_password, hashed_password)


# JWT Token creation

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):

    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiration to the token data
    to_encode.update({"exp": expire})
    
    # Create the token by encoding with our secret key
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Getting the current user
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
   
    

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract the email from the token
        email: str = payload.get("sub")
        
        # If no email in token, it's invalid
        if email is None:
            raise credentials_exception
            
    except JWTError:
        # Token is expired
        raise credentials_exception
    
    # Find the user in the database
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise credentials_exception
    
    
    return user