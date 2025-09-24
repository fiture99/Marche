# product.py
from datetime import datetime
import json
from app.extensions import db


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    images = db.Column(db.Text)  # JSON string of image URLs
    stock = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    vendor = db.relationship("Vendor", back_populates="products")
    category = db.relationship("Category", back_populates="products")
    order_items = db.relationship("OrderItem", back_populates="product", lazy="dynamic")
    cart_items = db.relationship("CartItem", back_populates="product", lazy="dynamic")
    
    @property
    def image_list(self):
        if self.images:
            try:
                return json.loads(self.images)
            except json.JSONDecodeError:
                return []
        return []

    @image_list.setter
    def image_list(self, images):
        self.images = json.dumps(images) if images else None
    
    @property
    def is_in_stock(self):
        return self.stock > 0
    
    # ✅ UNCOMMENT AND FIX THIS METHOD (remove the commented version below)
    # def to_dict(self):
    #     """Convert product to dictionary"""
    #     return {
    #         'id': self.id,
    #         'vendor_id': self.vendor_id,
    #         'category_id': self.category_id,
    #         'name': self.name,
    #         'description': self.description,
    #         'price': float(self.price),
    #         'images': self.image_list,
    #         'stock': self.stock,
    #         'rating': self.rating,
    #         'review_count': self.review_count,
    #         'is_featured': self.is_featured,
    #         'is_active': self.is_active,
    #         'is_in_stock': self.is_in_stock,
    #         'vendor': self.vendor.to_dict() if self.vendor else None,
    #         'category': self.category.to_dict() if self.category else None,
    #         # ✅ Add null checks for datetime fields
    #         'created_at': self.created_at.isoformat() if self.created_at else None,
    #         'updated_at': self.updated_at.isoformat() if self.updated_at else None
    #     }

    def to_dict(self):
        """Convert product to dictionary"""
        base_url = 'http://localhost:5000'
        
        # Handle image paths - convert to proper URLs
        image_urls = []
        for img_path in self.image_list:
            if not img_path:
                continue
                
            if isinstance(img_path, str):
                # Clean the path - get just the filename
                clean_path = img_path.replace('\\', '/')
                
                # Remove any directory prefixes but keep the path structure
                if 'uploads/products/' in clean_path:
                    # Extract just the filename part after uploads/products/
                    filename = clean_path.split('uploads/products/')[-1]
                else:
                    # Get just the filename if no directory structure
                    filename = clean_path.split('/')[-1]
                
                # Construct proper URL - use the simpler route
                image_urls.append(f'{base_url}/uploads/products/{filename}')
            else:
                image_urls.append(img_path)
        
        return {
            'id': self.id,
            'vendor_id': self.vendor_id,
            'category_id': self.category_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'images': image_urls,  # Use the properly formatted URLs
            'stock': self.stock,
            'rating': self.rating,
            'review_count': self.review_count,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'is_in_stock': self.is_in_stock,
            'vendor': self.vendor.to_dict() if self.vendor else None,
            'category': self.category.to_dict() if self.category else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Product {self.name}>"