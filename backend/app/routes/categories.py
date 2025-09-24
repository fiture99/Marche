from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.category import Category
from marshmallow import Schema, fields, ValidationError

categories_bp = Blueprint('categories', __name__)

# class CategorySchema(Schema):
#     name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
#     description = fields.Str(missing=None)
#     icon = fields.Str(missing=None)
class CategorySchema(Schema):
    name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    description = fields.Str(load_default=None)  # fixed
    icon = fields.Str(load_default=None)         # fixed


@categories_bp.route('', methods=['GET'])
def get_categories():
    """Get all active categories"""
    categories = Category.query.filter_by(is_active=True).order_by(Category.name.asc()).all()
    
    return jsonify({
        'categories': [category.to_dict() for category in categories]
    }), 200

@categories_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get single category"""
    category = Category.query.filter_by(id=category_id, is_active=True).first()
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    return jsonify({'category': category.to_dict()}), 200

@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """Create a new category (admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != UserRole.ADMIN:
        return jsonify({'error': 'Admin access required'}), 403
    
    schema = CategorySchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Check if category name already exists
    existing_category = Category.query.filter_by(name=data['name']).first()
    if existing_category:
        return jsonify({'error': 'Category name already exists'}), 409
    
    try:
        category = Category(
            name=data['name'],
            description=data.get('description'),
            icon=data.get('icon')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Category creation failed', 'message': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Update a category (admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != UserRole.ADMIN:
        return jsonify({'error': 'Admin access required'}), 403
    
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    data = request.json
    
    try:
        # Update allowed fields
        if 'name' in data:
            # Check if new name already exists (excluding current category)
            existing = Category.query.filter(
                Category.name == data['name'],
                Category.id != category_id
            ).first()
            if existing:
                return jsonify({'error': 'Category name already exists'}), 409
            category.name = data['name'].strip()
        
        if 'description' in data:
            category.description = data['description']
        if 'icon' in data:
            category.icon = data['icon']
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Category updated successfully',
            'category': category.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Category update failed', 'message': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Delete a category (admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != UserRole.ADMIN:
        return jsonify({'error': 'Admin access required'}), 403
    
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Check if category has products
    if category.product_count > 0:
        return jsonify({'error': 'Cannot delete category with existing products'}), 409
    
    try:
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({'message': 'Category deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Category deletion failed', 'message': str(e)}), 500