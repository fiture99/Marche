# vendor.py
from datetime import datetime
from enum import Enum
from app.extensions import db


class VendorStatus(Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    SUSPENDED = 'suspended'


class Vendor(db.Model):
    __tablename__ = 'vendors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    address = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(VendorStatus), default=VendorStatus.PENDING)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Relationships
    user = db.relationship("User", back_populates="vendor", uselist=False)
    products = db.relationship("Product", back_populates="vendor", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Vendor {self.name}>"
