from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod
from app.models.cart import CartItem
from marshmallow import Schema, fields, ValidationError
from decimal import Decimal
import random
import string

orders_bp = Blueprint('orders', __name__)

# Define nested schema first
class OrderItemSchema(Schema):
    product_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=lambda x: x > 0)

# Then define the main schema that references it
class CreateOrderSchema(Schema):
    items = fields.List(fields.Nested(OrderItemSchema), required=True, validate=lambda x: len(x) > 0)
    payment_method = fields.Str(required=True, validate=lambda x: x in [pm.value for pm in PaymentMethod])
    shipping_address = fields.Dict(required=True)
    notes = fields.Str(load_default=None)  # use load_default instead of missing

# In your orders_bp.py - update the CreateOrderSchema
# class CreateOrderSchema(Schema):
#     items = fields.List(fields.Nested(OrderItemSchema), required=True, validate=lambda x: len(x) > 0)
#     payment_method = fields.Str(required=True, validate=lambda x: x in [pm.value for pm in PaymentMethod])
#     shipping_address = fields.Dict(required=True)
#     notes = fields.Str(load_default=None)
    
#     # Add the new fields from frontend
#     payment_reference = fields.Str(load_default=None)
#     total_amount = fields.Decimal(load_default=None)
#     status = fields.Str(load_default=None)


# @orders_bp.route('', methods=['POST'])
# @jwt_required()
# def create_order():
#     """Create a new order"""
#     user_id = get_jwt_identity()
#     user = User.query.get(user_id)
    
#     if not user:
#         return jsonify({'error': 'User not found'}), 404
    
#     schema = CreateOrderSchema()
    
#     try:
#         data = schema.load(request.json)
#     except ValidationError as err:
#         return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
#     try:
#         # Validate products and calculate totals
#         order_items = []
#         subtotal = Decimal('0.00')
        
#         for item_data in data['items']:
#             product = Product.query.get(item_data['product_id'])
#             if not product or not product.is_active:
#                 return jsonify({'error': f'Product {item_data["product_id"]} not found or inactive'}), 404
            
#             if product.stock < item_data['quantity']:
#                 return jsonify({'error': f'Insufficient stock for product {product.name}'}), 400
            
#             unit_price = product.price
#             total_price = unit_price * item_data['quantity']
#             subtotal += total_price
            
#             order_items.append({
#                 'product': product,
#                 'quantity': item_data['quantity'],
#                 'unit_price': unit_price,
#                 'total_price': total_price
#             })
        
#         # Calculate tax and shipping (simplified)
#         tax_amount = Decimal('0.00')  # No tax for now
#         shipping_amount = Decimal('5.00') if subtotal < 50 else Decimal('0.00')  # Free shipping over $50
#         total_amount = subtotal + tax_amount + shipping_amount
        
#         # Create order
#         order = Order(
#             user_id=user_id,
#             payment_method=PaymentMethod(data['payment_method']),
#             subtotal=subtotal,
#             tax_amount=tax_amount,
#             shipping_amount=shipping_amount,
#             total_amount=total_amount,
#             notes=data.get('notes')
#         )
#         order.shipping_address_dict = data['shipping_address']
#         order.generate_order_number()
        
#         db.session.add(order)
#         db.session.flush()  # Get order ID
        
#         # Create order items and update product stock
#         for item_data in order_items:
#             order_item = OrderItem(
#                 order_id=order.id,
#                 product_id=item_data['product'].id,
#                 quantity=item_data['quantity'],
#                 unit_price=item_data['unit_price'],
#                 total_price=item_data['total_price']
#             )
#             db.session.add(order_item)
            
#             # Update product stock
#             item_data['product'].stock -= item_data['quantity']
        
#         # Clear user's cart items for ordered products
#         product_ids = [item['product'].id for item in order_items]
#         CartItem.query.filter(
#             CartItem.user_id == user_id,
#             CartItem.product_id.in_(product_ids)
#         ).delete(synchronize_session=False)
        
#         db.session.commit()
        
#         return jsonify({
#             'message': 'Order created successfully',
#             'order': order.to_dict()
#         }), 201
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': 'Order creation failed', 'message': str(e)}), 500



@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update the schema to accept the additional fields
    class CreateOrderSchema(Schema):
        items = fields.List(fields.Nested(OrderItemSchema), required=True, validate=lambda x: len(x) > 0)
        payment_method = fields.Str(required=True, validate=lambda x: x in [pm.value for pm in PaymentMethod])
        shipping_address = fields.Dict(required=True)
        notes = fields.Str(load_default=None)
        # Add the new optional fields from frontend
        payment_reference = fields.Str(load_default=None)
        total_amount = fields.Decimal(load_default=None)
        status = fields.Str(load_default=None)
    
    schema = CreateOrderSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    try:
        # Validate products and calculate totals
        order_items = []
        subtotal = Decimal('0.00')
        
        for item_data in data['items']:
            product = Product.query.get(item_data['product_id'])
            if not product or not product.is_active:
                return jsonify({'error': f'Product {item_data["product_id"]} not found or inactive'}), 404
            
            if product.stock < item_data['quantity']:
                return jsonify({'error': f'Insufficient stock for product {product.name}'}), 400
            
            unit_price = product.price
            total_price = unit_price * item_data['quantity']
            subtotal += total_price
            
            order_items.append({
                'product': product,
                'quantity': item_data['quantity'],
                'unit_price': unit_price,
                'total_price': total_price
            })
        
        # Calculate tax and shipping (simplified)
        tax_amount = Decimal('0.00')  # No tax for now
        shipping_amount = Decimal('5.00') if subtotal < 50 else Decimal('0.00')  # Free shipping over $50
        
        # Use frontend total_amount if provided, otherwise calculate it
        if data.get('total_amount'):
            total_amount = Decimal(str(data['total_amount']))
        else:
            total_amount = subtotal + tax_amount + shipping_amount
        
        # Combine notes with payment reference
        notes_parts = []
        if data.get('payment_reference'):
            notes_parts.append(f"Payment Reference: {data['payment_reference']}")
        if data.get('notes'):
            notes_parts.append(data['notes'])
        
        notes = "\n".join(notes_parts) if notes_parts else None
        
        # Use frontend status if provided and valid, otherwise default to PENDING
        if data.get('status'):
            try:
                # Map frontend status to backend OrderStatus
                status_mapping = {
                    'pending_payment': OrderStatus.PENDING,
                    'pending': OrderStatus.PENDING,
                    'processing': OrderStatus.PROCESSING,
                    'shipped': OrderStatus.SHIPPED,
                    'delivered': OrderStatus.DELIVERED,
                    'cancelled': OrderStatus.CANCELLED
                }
                order_status = status_mapping.get(data['status'], OrderStatus.PENDING)
            except (ValueError, KeyError):
                order_status = OrderStatus.PENDING
        else:
            order_status = OrderStatus.PENDING
        
        # Create order
        order = Order(
            user_id=user_id,
            status=order_status,  # Use the status from frontend
            payment_method=PaymentMethod(data['payment_method']),
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            notes=notes  # Combined notes with payment reference
        )
        order.shipping_address_dict = data['shipping_address']
        order.generate_order_number()
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and update product stock
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product'].id,
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                total_price=item_data['total_price']
            )
            db.session.add(order_item)
            
            # Update product stock
            item_data['product'].stock -= item_data['quantity']
        
        # Clear user's cart items for ordered products
        product_ids = [item['product'].id for item in order_items]
        CartItem.query.filter(
            CartItem.user_id == user_id,
            CartItem.product_id.in_(product_ids)
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Order creation failed', 'message': str(e)}), 500
@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_my_orders():
    """Get current user's orders"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    
    query = Order.query.filter_by(user_id=user_id)
    
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

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get single order details"""
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify({'order': order.to_dict()}), 200

@orders_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    """Cancel an order"""
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.status not in [OrderStatus.PENDING, OrderStatus.PROCESSING]:
        return jsonify({'error': 'Order cannot be cancelled'}), 400
    
    try:
        # Restore product stock
        for item in order.items:
            item.product.stock += item.quantity
        
        # Update order status
        order.status = OrderStatus.CANCELLED
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order cancelled successfully',
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Order cancellation failed', 'message': str(e)}), 500

# Cart endpoints
@orders_bp.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart items"""
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    
    total = sum(item.total_price for item in cart_items)
    
    return jsonify({
        'cart_items': [item.to_dict() for item in cart_items],
        'total': float(total),
        'item_count': len(cart_items)
    }), 200

@orders_bp.route('/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add item to cart"""
    user_id = get_jwt_identity()
    data = request.json
    
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id or quantity <= 0:
        return jsonify({'error': 'Invalid product_id or quantity'}), 400
    
    product = Product.query.get(product_id)
    if not product or not product.is_active:
        return jsonify({'error': 'Product not found or inactive'}), 404
    
    try:
        # Check if item already in cart
        cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
        
        if cart_item:
            # Update quantity
            new_quantity = cart_item.quantity + quantity
            if new_quantity > product.stock:
                return jsonify({'error': 'Insufficient stock'}), 400
            cart_item.quantity = new_quantity
        else:
            # Create new cart item
            if quantity > product.stock:
                return jsonify({'error': 'Insufficient stock'}), 400
            cart_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item added to cart',
            'cart_item': cart_item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add item to cart', 'message': str(e)}), 500

@orders_bp.route('/cart/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    """Update cart item quantity"""
    user_id = get_jwt_identity()
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    
    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404
    
    data = request.json
    quantity = data.get('quantity')
    
    if quantity is None or quantity < 0:
        return jsonify({'error': 'Invalid quantity'}), 400
    
    try:
        if quantity == 0:
            # Remove item from cart
            db.session.delete(cart_item)
        else:
            # Update quantity
            if quantity > cart_item.product.stock:
                return jsonify({'error': 'Insufficient stock'}), 400
            cart_item.quantity = quantity
        
        db.session.commit()
        
        return jsonify({'message': 'Cart updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update cart', 'message': str(e)}), 500

@orders_bp.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """Remove item from cart"""
    user_id = get_jwt_identity()
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    
    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404
    
    try:
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Item removed from cart'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove item from cart', 'message': str(e)}), 500

@orders_bp.route('/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    user_id = get_jwt_identity()
    
    try:
        CartItem.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Cart cleared successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to clear cart', 'message': str(e)}), 500