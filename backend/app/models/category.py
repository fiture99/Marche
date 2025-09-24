# category.py
from datetime import datetime
from app.extensions import db


class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = db.relationship("Product", back_populates="category", lazy="dynamic")

    @property
    def product_count(self):
        return self.products.filter_by(is_active=True).count()
    
    def to_dict(self):
        """Convert category to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'is_active': self.is_active,
            'product_count': self.product_count,
            # ✅ FIX: Add null checks for datetime fields
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Category {self.name}>"








#         {
#     "categories": [
#         {
#             "created_at": null,
#             "description": "Cosmetics, skincare, and health products",
#             "icon": "💄",
#             "id": 7,
#             "is_active": true,
#             "name": "Beauty & Health",
#             "product_count": 0,
#             "updated_at": null
#         },
#         {
#             "created_at": null,
#             "description": "Books, magazines, and educational materials",
#             "icon": "📚",
#             "id": 4,
#             "is_active": true,
#             "name": "Books",
#             "product_count": 0,
#             "updated_at": null
#         },
#         {
#             "created_at": null,
#             "description": "Apparel, fashion, and accessories",
#             "icon": "👕",
#             "id": 2,
#             "is_active": true,
#             "name": "Clothing",
#             "product_count": 0,
#             "updated_at": null
#         },
#         {
#             "created_at": null,
#             "description": "Devices, gadgets, and consumer electronics",
#             "icon": "📱",
#             "id": 1,
#             "is_active": true,
#             "name": "Electronics",
#             "product_count": 2,
#             "updated_at": null
#         },
#         {
#             "created_at": null,
#             "description": "Groceries, snacks, and drinks",
#             "icon": "🍎",
#             "id": 3,
#             "is_active": true,
#             "name": "Food & Beverages",
#             "product_count": 3,
#             "updated_at": null
#         },
#         {
#             "created_at": null,
#             "description": "Furniture, decor, and gardening supplies",
#             "icon": "🏠",
#             "id": 5,
#             "is_active": true,
#             "name": "Home & Garden",
#             "product_count": 2,
#             "updated_at": null
#         },
#         {
#             "created_at": null,
#             "description": "Miscellaneous products",
#             "icon": "🛒",
#             "id": 8,
#             "is_active": true,
#             "name": "Other",
#             "product_count": 1,
#             "updated_at": null
#         },
#         {
#             "created_at": null,
#             "description": "Sports equipment and outdoor gear",
#             "icon": "⚽",
#             "id": 6,
#             "is_active": true,
#             "name": "Sports & Outdoors",
#             "product_count": 1,
#             "updated_at": null
#         }
#     ]
# }