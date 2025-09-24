from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from enum import Enum
from app.extensions import db

class UserRole(Enum):
    CUSTOMER = 'customer'
    VENDOR = 'vendor'
    ADMIN = 'admin'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    avatar = db.Column(db.String(255))
    role = db.Column(db.Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Remove relationships that cause circular imports
    # orders = db.relationship('Order', backref='customer', lazy='dynamic', cascade='all, delete-orphan')
    # cart_items = db.relationship('CartItem', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    vendor = db.relationship('Vendor', backref='user_association', uselist=False, foreign_keys='Vendor.user_id')
    
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}"
    
    # Add a property to get vendor information without circular import
    # @property
    # def vendor(self):
    #     """Get vendor associated with this user"""
    #     from app.models.vendor import Vendor
    #     return Vendor.query.filter_by(user_id=self.id).first()
    
    def to_dict(self):
        """Convert user to dictionary"""
        vendor_data = None
        vendor_obj = self.vendor
        if vendor_obj:
            vendor_data = vendor_obj.to_dict()
        
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'phone': self.phone,
            'avatar': self.avatar,
            'role': self.role.value,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'vendor': vendor_data,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.email}>'