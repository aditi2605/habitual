from database import engine, Base
from models import User, Habit, HabitLog, Notification

# Create all tables
Base.metadata.create_all(bind=engine)
print("All tables created successfully!")