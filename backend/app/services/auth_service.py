from app.models.user import User
from app import db
import re

class AuthService:
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password):
        """Validate password strength"""
        if len(password) < 6:
            return False, "Password must be at least 6 characters long"
        
        # Add more password validation rules as needed
        return True, "Password is valid"
    
    @staticmethod
    def create_user(email, password, first_name, last_name, role='customer', phone=None):
        """Create a new user"""
        # Validate email
        if not AuthService.validate_email(email):
            raise ValueError("Invalid email format")
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            raise ValueError("Email already registered")
        
        # Validate password
        is_valid, message = AuthService.validate_password(password)
        if not is_valid:
            raise ValueError(message)
        
        # Create user
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone
        )
        user.set_password(password)
        
        return user
    
    @staticmethod
    def authenticate_user(email, password):
        """Authenticate user with email and password"""
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password) and user.is_active:
            return user
        
        return None