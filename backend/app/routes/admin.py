from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
from app.models.product import Product
from app.models.order import Order, OrderStatus
from sqlalchemy import func, desc
from app.extensions import db
from app.models.user import User

# Import db from the main app module
from app import db

admin_bp = Blueprint('admin', __name__)

def require_admin():
    """Decorator to require admin access"""
    identity = get_jwt_identity()
    
    try:
        user_id = int(identity)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid token identity'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != UserRole.ADMIN:
        return jsonify({'error': 'Admin access required'}), 403
    
    return user

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    # Get statistics
    total_users = User.query.count()
    total_vendors = Vendor.query.count()
    pending_vendors = Vendor.query.filter_by(status=VendorStatus.PENDING).count()
    approved_vendors = Vendor.query.filter_by(status=VendorStatus.APPROVED).count()
    total_products = Product.query.filter_by(is_active=True).count()
    total_orders = Order.query.count()
    pending_orders = Order.query.filter_by(status=OrderStatus.PENDING).count()
    
    # Revenue statistics
    total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED])
    ).scalar() or 0
    
    # Recent orders
    recent_orders = Order.query.order_by(desc(Order.created_at)).limit(5).all()
    
    return jsonify({
        'stats': {
            'total_users': total_users,
            'total_vendors': total_vendors,
            'pending_vendors': pending_vendors,
            'approved_vendors': approved_vendors,
            'total_products': total_products,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'total_revenue': float(total_revenue)
        },
        'recent_orders': [order.to_dict() for order in recent_orders]
    }), 200

@admin_bp.route('/vendors', methods=['GET'])
@jwt_required()
def get_all_vendors():
    """Get all vendors with filtering"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    
    query = Vendor.query
    
    if status:
        try:
            vendor_status = VendorStatus(status)
            query = query.filter_by(status=vendor_status)
        except ValueError:
            return jsonify({'error': 'Invalid status'}), 400
    
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

@admin_bp.route('/vendors/<int:vendor_id>/approve', methods=['PUT'])
@jwt_required()
def approve_vendor(vendor_id):
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    if vendor.status != VendorStatus.PENDING:
        return jsonify({'error': 'Only pending vendors can be approved'}), 400

    try:
        vendor.status = VendorStatus.APPROVED
        vendor.user.is_active = True  # ✅ Activate only when approved
        db.session.commit()

        return jsonify({
            'message': 'Vendor approved successfully',
            'vendor': vendor.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Vendor approval failed', 'message': str(e)}), 500


@admin_bp.route('/vendors/<int:vendor_id>/reject', methods=['PUT'])
@jwt_required()
def reject_vendor(vendor_id):
    """Reject a vendor application"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    if vendor.status != VendorStatus.PENDING:
        return jsonify({'error': 'Only pending vendors can be rejected'}), 400
    
    data = request.json
    rejection_reason = data.get('reason', 'Application rejected by admin')
    
    try:
        vendor.status = VendorStatus.REJECTED
        # You could add a rejection_reason field to the model if needed
        
        db.session.commit()
        
        return jsonify({
            'message': 'Vendor rejected successfully',
            'vendor': vendor.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Vendor rejection failed', 'message': str(e)}), 500

@admin_bp.route('/vendors/<int:vendor_id>/suspend', methods=['PUT'])
@jwt_required()
def suspend_vendor(vendor_id):
    """Suspend a vendor"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    try:
        vendor.status = VendorStatus.SUSPENDED
        
        # Deactivate all vendor's products
        Product.query.filter_by(vendor_id=vendor_id).update({'is_active': False})
        
        db.session.commit()
        
        return jsonify({
            'message': 'Vendor suspended successfully',
            'vendor': vendor.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Vendor suspension failed', 'message': str(e)}), 500

@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    """Get all orders"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    
    query = Order.query
    
    if status:
        try:
            order_status = OrderStatus(status)
            query = query.filter_by(status=order_status)
        except ValueError:
            return jsonify({'error': 'Invalid status'}), 400
    
    orders = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'orders': [order.to_dict() for order in orders.items],
        'pagination': {
            'page': page,
            'pages': orders.pages,
            'per_page': per_page,
            'total': orders.total,
            'has_next': orders.has_next,
            'has_prev': orders.has_prev
        }
    }), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """Update order status"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.json
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        order_status = OrderStatus(new_status)
        order.status = order_status
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order status updated successfully',
            'order': order.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid status'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Status update failed', 'message': str(e)}), 500

@admin_bp.route('/products', methods=['GET'])
@jwt_required()
def get_all_products():
    """Get all products for admin review"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    
    query = Product.query
    
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

@admin_bp.route('/products/<int:product_id>/toggle-active', methods=['PUT'])
@jwt_required()
def toggle_product_active(product_id):
    """Toggle product active status"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    try:
        product.is_active = not product.is_active
        db.session.commit()
        
        status = 'activated' if product.is_active else 'deactivated'
        
        return jsonify({
            'message': f'Product {status} successfully',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Status toggle failed', 'message': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users"""
    user = require_admin()
    if isinstance(user, tuple):
        return user
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    role = request.args.get('role')
    
    query = User.query
    
    if role:
        try:
            user_role = UserRole(role)
            query = query.filter_by(role=user_role)
        except ValueError:
            return jsonify({'error': 'Invalid role'}), 400
    
    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'pagination': {
            'page': page,
            'pages': users.pages,
            'per_page': per_page,
            'total': users.total,
            'has_next': users.has_next,
            'has_prev': users.has_prev
        }
    }), 200

    