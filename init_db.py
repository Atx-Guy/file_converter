from app import app, db

with app.app_context():
    db.drop_all()  # This will clear any existing tables
    db.create_all()  # This will create all tables fresh
    print("Database tables created successfully!") 