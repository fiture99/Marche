from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from app.extensions import db
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
import re

auth_bp = Blueprint('auth', __name__)

class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 6)
    first_name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    last_name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    phone = fields.Str(load_default=None)
    role = fields.Str(load_default='customer', validate=lambda x: x in ['customer', 'vendor'])

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

@auth_bp.route('/create-admin', methods=['POST'])
@jwt_required()
def create_admin():
    """Create an admin user (admin-only access)"""

    # Get current user
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    # Only admins are allowed to create other admins
    if not current_user or current_user.role != UserRole.ADMIN:
        return jsonify({'error': 'Unauthorized. Admin access required.'}), 403

    data = request.json
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')

    # Basic validation
    if not email or not password or not first_name or not last_name:
        return jsonify({"error": "Missing required fields"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    try:
        # Create admin user
        admin_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=UserRole.ADMIN,
            is_active=True
        )
        admin_user.set_password(password)

        db.session.add(admin_user)
        db.session.commit()

        return jsonify({
            "message": "Admin user created successfully",
            "user": admin_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create admin", "message": str(e)}), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    schema = RegisterSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    try:
        # Determine role
        role = UserRole.VENDOR if data['role'] == 'vendor' else UserRole.CUSTOMER
        
        # Vendors are inactive by default until admin validation
        is_active = False if role == UserRole.VENDOR else True

        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            role=role,
            is_active=is_active
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.flush()  # Get the user ID without committing

        # If registering as vendor, create a vendor record
        if role == UserRole.VENDOR:
            vendor = Vendor(
                user_id=user.id,
                name=f"{data['first_name']} {data['last_name']}",
                email=data['email'],
                phone=data.get('phone'),
                status=VendorStatus.PENDING
            )
            db.session.add(vendor)

        db.session.commit()

        # Create tokens only for active users
        access_token = create_access_token(identity=str(user.id)) if is_active else None
        refresh_token = create_refresh_token(identity=str(user.id)) if is_active else None

        response = {
            'message': 'User registered successfully',
            'user': user.to_dict()
        }

        if is_active:
            response['access_token'] = access_token
            response['refresh_token'] = refresh_token
        else:
            response['info'] = 'Vendor registration pending validation by admin'

        return jsonify(response), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    schema = LoginSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 401
    
    # Create tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    # user_id = get_jwt_identity()
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    # user_id = get_jwt_identity()
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({'error': 'Invalid user'}), 401
    
    # access_token = create_access_token(identity=user_id)
    # Fixed code
    access_token = create_access_token(identity=str(user.id))

    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    # user_id = get_jwt_identity()
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    
    try:
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
        if 'phone' in data:
            user.phone = data['phone']
        if 'avatar' in data:
            user.avatar = data['avatar']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'message': str(e)}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    # user_id = get_jwt_identity()
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long'}), 400
    
    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    try:
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password change failed', 'message': str(e)}), 500