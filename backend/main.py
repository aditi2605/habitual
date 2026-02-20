from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth_routes import router as auth_router
from routers.habit_routes import router as habit_router
from routers.log_routes import router as log_router 

# create FASTAPI app
app = FastAPI(
    title="Habitual ",
    description="Habit tracking app with AI-powered insights",
    version="1.0.0"
)


# cors middleware(Allow React frontend to connect)
# This allows your React app (running on localhost:3000) 
# to make requests to this API (running on localhost:8000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# include routes(login, signup, habits(create, update, delete))
app.include_router(auth_router)
app.include_router(habit_router)
app.include_router(log_router)


# test server is running
@app.get("/")
def root():
    return {
        "message": "API is running!",
        "docs": "http://localhost:8000/docs"
    }