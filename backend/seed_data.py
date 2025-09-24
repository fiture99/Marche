from app import create_app, db
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
from app.models.category import Category
from app.models.product import Product
import json

def seed_database():
    """Seed the database with initial data"""
    app = create_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create admin user
        admin = User(
            email='admin@marche.gm',
            first_name='Admin',
            last_name='User',
            role=UserRole.ADMIN
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create categories
        categories_data = [
            {'name': 'Electronics', 'icon': '📱', 'description': 'Phones, computers, and electronic devices'},
            {'name': 'Fashion', 'icon': '👕', 'description': 'Clothing, shoes, and accessories'},
            {'name': 'Food & Beverages', 'icon': '🍎', 'description': 'Fresh produce and food items'},
            {'name': 'Home & Garden', 'icon': '🏠', 'description': 'Home improvement and garden supplies'},
            {'name': 'Beauty & Health', 'icon': '💄', 'description': 'Cosmetics and health products'},
            {'name': 'Sports', 'icon': '⚽', 'description': 'Sports equipment and accessories'}
        ]
        
        categories = []
        for cat_data in categories_data:
            category = Category(**cat_data)
            categories.append(category)
            db.session.add(category)
        
        # Create vendor users
        vendor_users_data = [
            {
                'email': 'fatou@banjulelectronics.gm',
                'first_name': 'Fatou',
                'last_name': 'Ceesay',
                'role': UserRole.VENDOR,
                'vendor_data': {
                    'name': 'Banjul Electronics',
                    'description': 'Premium electronics and gadgets for modern living',
                    'email': 'fatou@banjulelectronics.gm',
                    'phone': '+220 123 4567',
                    'address': 'Independence Drive, Banjul',
                    'status': VendorStatus.APPROVED
                }
            },
            {
                'email': 'amadou@fashionhub.gm',
                'first_name': 'Amadou',
                'last_name': 'Jallow',
                'role': UserRole.VENDOR,
                'vendor_data': {
                    'name': 'Serrekunda Fashion Hub',
                    'description': 'Traditional and modern African fashion',
                    'email': 'amadou@fashionhub.gm',
                    'phone': '+220 234 5678',
                    'address': 'Westfield Junction, Serrekunda',
                    'status': VendorStatus.APPROVED
                }
            },
            {
                'email': 'awa@kombosfresh.gm',
                'first_name': 'Awa',
                'last_name': 'Sanneh',
                'role': UserRole.VENDOR,
                'vendor_data': {
                    'name': 'Kombos Fresh Market',
                    'description': 'Fresh local produce and organic foods',
                    'email': 'awa@kombosfresh.gm',
                    'phone': '+220 345 6789',
                    'address': 'Sukuta Market, Western Region',
                    'status': VendorStatus.APPROVED
                }
            }
        ]
        
        vendors = []
        for user_data in vendor_users_data:
            # Create user
            user = User(
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role']
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.flush()  # Get user ID
            
            # Create vendor
            vendor_data = user_data['vendor_data']
            vendor = Vendor(
                user_id=user.id,
                **vendor_data
            )
            vendors.append(vendor)
            db.session.add(vendor)
        
        # Create customer user
        customer = User(
            email='customer@demo.com',
            first_name='John',
            last_name='Doe',
            role=UserRole.CUSTOMER
        )
        customer.set_password('password123')
        db.session.add(customer)
        
        db.session.commit()
        
        # Create products
        products_data = [
            {
                'name': 'iPhone 15 Pro Max',
                'description': 'Latest Apple iPhone with advanced camera system and A17 chip',
                'price': 1299.00,
                'category': 'Electronics',
                'vendor': 'Banjul Electronics',
                'images': [
                    'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=500',
                    'https://images.pexels.com/photos/163084/phone-mobile-smartphone-colorful-163084.jpeg?auto=compress&cs=tinysrgb&w=500'
                ],
                'stock': 15,
                'rating': 4.8,
                'review_count': 24,
                'is_featured': True
            },
            {
                'name': 'Traditional Gambian Kaftan',
                'description': 'Handwoven traditional Gambian kaftan with intricate embroidery',
                'price': 85.00,
                'category': 'Fashion',
                'vendor': 'Serrekunda Fashion Hub',
                'images': [
                    'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=500',
                    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500'
                ],
                'stock': 8,
                'rating': 4.9,
                'review_count': 15,
                'is_featured': True
            },
            {
                'name': 'Fresh Organic Mangoes',
                'description': 'Sweet and juicy organic mangoes from local farms',
                'price': 12.00,
                'category': 'Food & Beverages',
                'vendor': 'Kombos Fresh Market',
                'images': [
                    'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=500',
                    'https://images.pexels.com/photos/1093838/pexels-photo-1093838.jpeg?auto=compress&cs=tinysrgb&w=500'
                ],
                'stock': 50,
                'rating': 4.7,
                'review_count': 32,
                'is_featured': False
            }
        ]
        
        for product_data in products_data:
            # Find category and vendor
            category = Category.query.filter_by(name=product_data['category']).first()
            vendor = Vendor.query.filter_by(name=product_data['vendor']).first()
            
            if category and vendor:
                product = Product(
                    vendor_id=vendor.id,
                    category_id=category.id,
                    name=product_data['name'],
                    description=product_data['description'],
                    price=product_data['price'],
                    stock=product_data['stock'],
                    rating=product_data['rating'],
                    review_count=product_data['review_count'],
                    is_featured=product_data['is_featured']
                )
                product.image_list = product_data['images']
                db.session.add(product)
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()