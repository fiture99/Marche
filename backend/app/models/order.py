from app import db
from datetime import datetime
from enum import Enum
import json
from app.extensions import db


class OrderStatus(Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    SHIPPED = 'shipped'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'

class PaymentMethod(Enum):
    QCELL_MONEY = 'qcell_money'
    AFRICELL_MONEY = 'africell_money'
    WAVE = 'wave'
    BANK = 'trustBank'
    PAYPAL = 'paypal'

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), nullable=False)
    payment_status = db.Column(db.String(20), default='pending')
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    shipping_amount = db.Column(db.Numeric(10, 2), default=0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    shipping_address = db.Column(db.Text)  # JSON string
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    items = db.relationship('OrderItem', back_populates='order', lazy='dynamic', cascade='all, delete-orphan')
    # items = db.relationship('OrderItem', back_populates='order', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def shipping_address_dict(self):
        """Get shipping address as dictionary"""
        if self.shipping_address:
            try:
                return json.loads(self.shipping_address)
            except json.JSONDecodeError:
                return {}
        return {}
    
    @shipping_address_dict.setter
    def shipping_address_dict(self, address):
        """Set shipping address from dictionary"""
        self.shipping_address = json.dumps(address) if address else None
    
    @property
    def item_count(self):
        """Get total number of items in order"""
        return sum(item.quantity for item in self.items)
    
    def generate_order_number(self):
        """Generate unique order number"""
        import random
        import string
        
        prefix = 'MRC'
        suffix = ''.join(random.choices(string.digits, k=8))
        self.order_number = f"{prefix}{suffix}"
    
    def to_dict(self):
        """Convert order to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'order_number': self.order_number,
            'status': self.status.value,
            'payment_method': self.payment_method.value,
            'payment_status': self.payment_status,
            'subtotal': float(self.subtotal),
            'tax_amount': float(self.tax_amount),
            'shipping_amount': float(self.shipping_amount),
            'total_amount': float(self.total_amount),
            'shipping_address': self.shipping_address_dict,
            'notes': self.notes,
            'item_count': self.item_count,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Order {self.order_number}>'

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    order = db.relationship('Order', back_populates='items')
    product = db.relationship('Product', back_populates='order_items')

    def to_dict(self):
        """Convert order item to dictionary"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'total_price': float(self.total_price),
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'