from fastapi import Request
from fastapi.responses import JSONResponse

async def rate_limit_exceeded_handler(request: Request, exc):
    """Custom rate limit error message"""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please slow down and try again in a few minutes.",
            "retry_after": "1 hour"
        }
    )