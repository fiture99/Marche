from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
from app.models.product import Product
from app.models.order import Order
from app.models.category import Category  # ✅ Add this line

from marshmallow import Schema, fields, ValidationError
from sqlalchemy import or_
import os
from werkzeug.utils import secure_filename
from decimal import Decimal

vendors_bp = Blueprint('vendors', __name__)

# Allowed file extensions for images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class VendorApplicationSchema(Schema):
    name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    description = fields.Str(required=True)
    email = fields.Email(required=True)
    phone = fields.Str(required=True)
    address = fields.Str(required=True)
    logo = fields.Str(load_default=None)
    banner = fields.Str(load_default=None)

@vendors_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_as_vendor():
    """Apply to become a vendor"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user already has a vendor application
    existing_vendor = Vendor.query.filter_by(user_id=user_id).first()
    if existing_vendor:
        return jsonify({'error': 'Vendor application already exists'}), 409
    
    schema = VendorApplicationSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    try:
        # Create vendor application
        vendor = Vendor(
            user_id=user_id,
            name=data['name'],
            description=data['description'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            logo=data.get('logo'),
            banner=data.get('banner'),
            status=VendorStatus.PENDING
        )
        
        db.session.add(vendor)
        db.session.commit()
        
        return jsonify({
            'message': 'Vendor application submitted successfully',
            'vendor': vendor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Application failed', 'message': str(e)}), 500

@vendors_bp.route('', methods=['GET'])
def get_vendors():
    """Get list of approved vendors"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    search = request.args.get('search', '')
    
    query = Vendor.query.filter_by(status=VendorStatus.APPROVED)
    
    if search:
        query = query.filter(
            or_(
                Vendor.name.ilike(f'%{search}%'),
                Vendor.description.ilike(f'%{search}%')
            )
        )
    
    vendors = query.order_by(Vendor.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'vendors': [vendor.to_dict() for vendor in vendors.items],
        'pagination': {
            'page': page,
            'pages': vendors.pages,
            'per_page': per_page,
            'total': vendors.total,
            'has_next': vendors.has_next,
            'has_prev': vendors.has_prev
        }
    }), 200

@vendors_bp.route('/<int:vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    """Get vendor details"""
    vendor = Vendor.query.get(vendor_id)
    
    if not vendor or vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Vendor not found'}), 404
    
    return jsonify({'vendor': vendor.to_dict()}), 200

@vendors_bp.route('/my-vendor', methods=['GET'])
@jwt_required()
def get_my_vendor():
    """Get current user's vendor profile"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor:
        return jsonify({'error': 'Vendor profile not found'}), 404
    
    return jsonify({'vendor': vendor.to_dict()}), 200

@vendors_bp.route('/my-vendor', methods=['PUT'])
@jwt_required()
def update_my_vendor():
    """Update current user's vendor profile"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor:
        return jsonify({'error': 'Vendor profile not found'}), 404
    
    data = request.json
    
    try:
        # Update allowed fields
        if 'name' in data:
            vendor.name = data['name'].strip()
        if 'description' in data:
            vendor.description = data['description']
        if 'email' in data:
            vendor.email = data['email']
        if 'phone' in data:
            vendor.phone = data['phone']
        if 'address' in data:
            vendor.address = data['address']
        if 'logo' in data:
            vendor.logo = data['logo']
        if 'banner' in data:
            vendor.banner = data['banner']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Vendor profile updated successfully',
            'vendor': vendor.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'message': str(e)}), 500

@vendors_bp.route('/products', methods=['GET'])
@jwt_required()
def get_vendor_products():
    """Get current vendor's products"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor:
        return jsonify({'error': 'Vendor profile not found'}), 404
    
    if vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Vendor not approved'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    
    query = Product.query.filter_by(vendor_id=vendor.id)
    if not include_inactive:
        query = query.filter_by(is_active=True)
    
    products = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'pagination': {
            'page': page,
            'pages': products.pages,
            'per_page': per_page,
            'total': products.total,
            'has_next': products.has_next,
            'has_prev': products.has_prev
        }
    }), 200

# @vendors_bp.route('/products', methods=['POST'])
# @jwt_required()
# def create_vendor_product():
#     """Create a new product for the current vendor"""
#     user_id = get_jwt_identity()
#     vendor = Vendor.query.filter_by(user_id=user_id).first()
    
#     if not vendor:
#         return jsonify({'error': 'Vendor profile not found'}), 404
    
#     if vendor.status != VendorStatus.APPROVED:
#         return jsonify({'error': 'Vendor not approved'}), 403
    
#     # Handle form data for file uploads
#     if request.content_type.startswith('multipart/form-data'):
#         data = {
#             'name': request.form.get('name'),
#             'description': request.form.get('description'),
#             'price': request.form.get('price'),
#             'stock': request.form.get('stock'),
#             'category': request.form.get('category'),
#             'is_active': request.form.get('is_active', 'true').lower() == 'true'
#         }
        
#         # Handle image upload
#         if 'image' in request.files:
#             image_file = request.files['image']
#             if image_file and allowed_file(image_file.filename):
#                 filename = secure_filename(image_file.filename)
#                 image_path = os.path.join('uploads', 'products', filename)
#                 os.makedirs(os.path.dirname(image_path), exist_ok=True)
#                 image_file.save(image_path)
#                 data['image'] = f'/static/{image_path}'
#     else:
#         data = request.get_json()
    
#     # Validate required fields
#     required_fields = ['name', 'price', 'stock', 'category', 'description']
#     for field in required_fields:
#         if not data.get(field):
#             return jsonify({'error': f'Missing required field: {field}'}), 400
    
#     try:
#         # Create product
#         product = Product(
#             vendor_id=vendor.id,
#             name=data['name'],
#             description=data['description'],
#             price=Decimal(str(data['price'])),
#             stock=int(data['stock']),
#             category=data['category'],
#             is_active=data.get('is_active', True)
#         )
        
#         if data.get('image'):
#             product.image = data['image']
        
#         db.session.add(product)
#         db.session.commit()
        
#         return jsonify({
#             'message': 'Product created successfully',
#             'product': product.to_dict()
#         }), 201
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': 'Product creation failed', 'message': str(e)}), 500

import logging

# app/routes/vendors.py
@vendors_bp.route('/products', methods=['POST'])
@jwt_required()
def create_vendor_product():
    print(f"📨 Request Content-Type: {request.content_type}")
    print(f"📨 Is JSON: {request.is_json}")
    print(f"📨 Form data: {dict(request.form)}")
    print(f"📨 Files: {dict(request.files)}")
    try:
        user_id = get_jwt_identity()
        vendor = Vendor.query.filter_by(user_id=user_id).first()
        
        if not vendor or vendor.status != VendorStatus.APPROVED:
            return jsonify({'error': 'Only approved vendors can create products'}), 403
        
        data = {}
        
        # Handle both form data and JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Form data handling
            data = {
                'name': request.form.get('name'),
                'price': request.form.get('price'),
                'stock': request.form.get('stock'),
                'description': request.form.get('description'),
                'category': request.form.get('category'),
                'is_active': request.form.get('is_active', 'true').lower() == 'true'
            }
            
            # Handle image upload
            if 'image' in request.files:
                image_file = request.files['image']
                if image_file and image_file.filename != '':
                    filename = secure_filename(image_file.filename)
                    # Save file and get path
                    image_path = os.path.join('uploads', 'products', filename)
                    os.makedirs(os.path.dirname(image_path), exist_ok=True)
                    image_file.save(image_path)
                    data['image'] = f'/static/{image_path}'
                    
        elif request.is_json:
            # JSON data handling
            data = request.get_json()
        else:
            return jsonify({'error': 'Unsupported content type'}), 400
        
        # Validate required fields
        required_fields = ['name', 'price', 'stock', 'description', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Find category by name
        category = Category.query.filter_by(name=data['category']).first()
        if not category:
            return jsonify({'error': f'Category "{data["category"]}" not found'}), 404
        
        # Create product
        product = Product(
            vendor_id=vendor.id,
            category_id=category.id,
            name=data['name'],
            description=data['description'],
            price=float(data['price']),
            stock=int(data['stock']),
            is_active=data.get('is_active', True)
        )
        
        if data.get('image'):
            product.image_list = [data['image']]
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
            
    except Exception as e:
        db.session.rollback()
        print(f"Error creating product: {str(e)}")
        return jsonify({'error': 'Failed to create product', 'message': str(e)}), 500



@vendors_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_vendor_product(product_id):
    """Update a product for the current vendor"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor:
        return jsonify({'error': 'Vendor profile not found'}), 404
    
    if vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Vendor not approved'}), 403
    
    product = Product.query.filter_by(id=product_id, vendor_id=vendor.id).first()
    if not product:
        return jsonify({'error': 'Product not found or access denied'}), 404
    
    # Handle form data or JSON
    if request.content_type.startswith('multipart/form-data'):
        data = {}
        for key in request.form:
            data[key] = request.form.get(key)
        
        # Handle image upload
        if 'images' in request.files:
            image_files = request.files.getlist('images')
            image_paths = []
            for image_file in image_files:
                if image_file and allowed_file(image_file.filename):
                    filename = secure_filename(image_file.filename)
                    image_path = os.path.join('uploads', 'products', filename)
                    os.makedirs(os.path.dirname(image_path), exist_ok=True)
                    image_file.save(image_path)
                    image_paths.append(f'/static/{image_path}')
            
            if image_paths:
                # Convert list to JSON string or handle based on your DB structure
                data['images'] = json.dumps(image_paths)
    else:
        data = request.get_json()
    
    try:
        # Update product fields
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = Decimal(str(data['price']))
        if 'stock' in data:
            product.stock = int(data['stock'])
        if 'category' in data:
            # FIX: Find the Category instance by name, don't assign string directly
            category_name = data['category']
            category = Category.query.filter_by(name=category_name).first()
            if category:
                product.category_id = category.id  # Assign the foreign key ID
            else:
                return jsonify({'error': f'Category "{category_name}" not found'}), 400
        if 'is_active' in data:
            product.is_active = data['is_active'].lower() == 'true' if isinstance(data['is_active'], str) else bool(data['is_active'])
        if 'images' in data:
            # Handle images based on your database structure
            # If images is stored as JSON string, parse it
            if isinstance(data['images'], str):
                try:
                    product.images = json.loads(data['images'])
                except json.JSONDecodeError:
                    product.images = [data['images']]
            else:
                product.images = data['images']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()  # This will help with debugging
        return jsonify({'error': 'Product update failed', 'message': str(e)}), 500

@vendors_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_vendor_product(product_id):
    """Delete a product for the current vendor"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor:
        return jsonify({'error': 'Vendor profile not found'}), 404
    
    if vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Vendor not approved'}), 403
    
    product = Product.query.filter_by(id=product_id, vendor_id=vendor.id).first()
    if not product:
        return jsonify({'error': 'Product not found or access denied'}), 404
    
    try:
        # Soft delete - mark as inactive
        product.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Product deletion failed', 'message': str(e)}), 500

@vendors_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_vendor_orders():
    """Get current vendor's orders"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor:
        return jsonify({'error': 'Vendor profile not found'}), 404
    
    if vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Vendor not approved'}), 403
    
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', None)
    
    # Base query
    query = Order.query.filter_by(vendor_id=vendor.id)
    
    # Apply status filter if provided
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    # Paginate results
    orders = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    
    return jsonify({
        'orders': [order.to_dict() for order in orders.items],
        'pagination': {
            'page': page,
            'pages': orders.pages,
            'per_page': 10,
            'total': orders.total,
            'has_next': orders.has_next,
            'has_prev': orders.has_prev
        }
    }), 200