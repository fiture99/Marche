from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
from app.models.product import Product
from app.models.category import Category
from marshmallow import Schema, fields, ValidationError
from sqlalchemy import or_, and_
from decimal import Decimal

products_bp = Blueprint('products', __name__)

# class ProductSchema(Schema):
#     name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
#     description = fields.Str(required=True)
#     price = fields.Decimal(required=True, validate=lambda x: x > 0)
#     category_id = fields.Int(required=True)
#     images = fields.List(fields.Str(), missing=[])
#     stock = fields.Int(missing=0, validate=lambda x: x >= 0)
#     is_featured = fields.Bool(missing=False)

class ProductSchema(Schema):
    name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    description = fields.Str(required=True)
    price = fields.Decimal(required=True, validate=lambda x: x > 0)
    category_id = fields.Int(required=True)
    images = fields.List(fields.Str(), load_default=[])   # fixed
    stock = fields.Int(load_default=0, validate=lambda x: x >= 0)  # fixed
    is_featured = fields.Bool(load_default=False)  # fixed


@products_bp.route('', methods=['GET'])
def get_products():
    """Get list of products with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    category_id = request.args.get('category_id', type=int)
    vendor_id = request.args.get('vendor_id', type=int)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort_by = request.args.get('sort_by', 'newest')
    featured_only = request.args.get('featured', 'false').lower() == 'true'
    
    # Base query - only active products from approved vendors
    query = Product.query.join(Vendor).filter(
        and_(
            Product.is_active == True,
            Vendor.status == VendorStatus.APPROVED
        )
    )
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if vendor_id:
        query = query.filter(Product.vendor_id == vendor_id)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if featured_only:
        query = query.filter(Product.is_featured == True)
    
    # Apply sorting
    if sort_by == 'price_low':
        query = query.order_by(Product.price.asc())
    elif sort_by == 'price_high':
        query = query.order_by(Product.price.desc())
    elif sort_by == 'rating':
        query = query.order_by(Product.rating.desc())
    elif sort_by == 'name':
        query = query.order_by(Product.name.asc())
    else:  # newest
        query = query.order_by(Product.created_at.desc())
    
    products = query.paginate(page=page, per_page=per_page, error_out=False)
    
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

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product details"""
    product = Product.query.join(Vendor).filter(
        and_(
            Product.id == product_id,
            Product.is_active == True,
            Vendor.status == VendorStatus.APPROVED
        )
    ).first()
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({'product': product.to_dict()}), 200

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product (vendor only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user is a vendor
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    if not vendor or vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Only approved vendors can create products'}), 403
    
    schema = ProductSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Verify category exists
    category = Category.query.get(data['category_id'])
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    try:
        # Create product
        product = Product(
            vendor_id=vendor.id,
            category_id=data['category_id'],
            name=data['name'],
            description=data['description'],
            price=data['price'],
            stock=data['stock'],
            is_featured=data['is_featured']
        )
        product.image_list = data['images']
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Product creation failed', 'message': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update a product (vendor only, own products)"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor or vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Only approved vendors can update products'}), 403
    
    product = Product.query.filter_by(id=product_id, vendor_id=vendor.id).first()
    if not product:
        return jsonify({'error': 'Product not found or access denied'}), 404
    
    data = request.json
    
    try:
        # Update allowed fields
        if 'name' in data:
            product.name = data['name'].strip()
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = Decimal(str(data['price']))
        if 'category_id' in data:
            category = Category.query.get(data['category_id'])
            if not category:
                return jsonify({'error': 'Category not found'}), 404
            product.category_id = data['category_id']
        if 'images' in data:
            product.image_list = data['images']
        if 'stock' in data:
            product.stock = data['stock']
        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Product update failed', 'message': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product (vendor only, own products)"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor or vendor.status != VendorStatus.APPROVED:
        return jsonify({'error': 'Only approved vendors can delete products'}), 403
    
    product = Product.query.filter_by(id=product_id, vendor_id=vendor.id).first()
    if not product:
        return jsonify({'error': 'Product not found or access denied'}), 404
    
    try:
        # Soft delete - just mark as inactive
        product.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Product deletion failed', 'message': str(e)}), 500

@products_bp.route('/my-products', methods=['GET'])
@jwt_required()
def get_my_products():
    """Get current vendor's products"""
    user_id = get_jwt_identity()
    vendor = Vendor.query.filter_by(user_id=user_id).first()
    
    if not vendor:
        return jsonify({'error': 'Vendor profile not found'}), 404
    
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


@products_bp.route('/all', methods=['GET'])
def get_all_products():
    """Get all products (including inactive ones) - for public access"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)  # Large per_page to get all
    include_inactive = request.args.get('include_inactive', 'true').lower() == 'true'
    query = Product.query.join(Vendor).filter(
        Vendor.status == VendorStatus.APPROVED  # Only products from approved vendors
    )
    if not include_inactive:
        query = query.filter(Product.is_active == True)
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