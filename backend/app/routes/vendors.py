from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
from app.models.product import Product
from app.models.order import Order
from app.models.category import Category  # ✅ Add this line
from app.services.google_drive_service import GoogleDriveService  # Add this import


from marshmallow import Schema, fields, ValidationError
from sqlalchemy import or_
import os
from werkzeug.utils import secure_filename
from decimal import Decimal

vendors_bp = Blueprint('vendors', __name__)
drive_service = GoogleDriveService()  # Initialize Google Drive service


# Allowed file extensions for images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp','avif'}

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
# @vendors_bp.route('/products', methods=['POST'])
# @jwt_required()
# def create_vendor_product():
#     print(f"📨 Request Content-Type: {request.content_type}")
#     print(f"📨 Is JSON: {request.is_json}")
#     print(f"📨 Form data: {dict(request.form)}")
#     print(f"📨 Files: {dict(request.files)}")
#     try:
#         user_id = get_jwt_identity()
#         vendor = Vendor.query.filter_by(user_id=user_id).first()
        
#         if not vendor or vendor.status != VendorStatus.APPROVED:
#             return jsonify({'error': 'Only approved vendors can create products'}), 403
        
#         data = {}
        
#         # Handle both form data and JSON
#         if request.content_type and 'multipart/form-data' in request.content_type:
#             # Form data handling
#             data = {
#                 'name': request.form.get('name'),
#                 'price': request.form.get('price'),
#                 'stock': request.form.get('stock'),
#                 'description': request.form.get('description'),
#                 'category': request.form.get('category'),
#                 'is_active': request.form.get('is_active', 'true').lower() == 'true'
#             }
            
#             # Handle image upload
#             if 'image' in request.files:
#                 image_file = request.files['image']
#                 if image_file and image_file.filename != '':
#                     filename = secure_filename(image_file.filename)
#                     # Save file and get path
#                     image_path = os.path.join('uploads', 'products', filename)
#                     os.makedirs(os.path.dirname(image_path), exist_ok=True)
#                     image_file.save(image_path)
#                     data['image'] = f'/static/{image_path}'
                    
#         elif request.is_json:
#             # JSON data handling
#             data = request.get_json()
#         else:
#             return jsonify({'error': 'Unsupported content type'}), 400
        
#         # Validate required fields
#         required_fields = ['name', 'price', 'stock', 'description', 'category']
#         for field in required_fields:
#             if not data.get(field):
#                 return jsonify({'error': f'Missing required field: {field}'}), 400
        
#         # Find category by name
#         category = Category.query.filter_by(name=data['category']).first()
#         if not category:
#             return jsonify({'error': f'Category "{data["category"]}" not found'}), 404
        
#         # Create product
#         product = Product(
#             vendor_id=vendor.id,
#             category_id=category.id,
#             name=data['name'],
#             description=data['description'],
#             price=float(data['price']),
#             stock=int(data['stock']),
#             is_active=data.get('is_active', True)
#         )
        
#         if data.get('image'):
#             product.image_list = [data['image']]
        
#         db.session.add(product)
#         db.session.commit()
        
#         return jsonify({
#             'message': 'Product created successfully',
#             'product': product.to_dict()
#         }), 201
            
#     except Exception as e:
#         db.session.rollback()
#         print(f"Error creating product: {str(e)}")
#         return jsonify({'error': 'Failed to create product', 'message': str(e)}), 500

@vendors_bp.route('/debug-drive-upload', methods=['POST'])
def debug_drive_upload():
    """Debug route to test Google Drive upload without authentication"""
    try:
        print("🧪 DEBUG GOOGLE DRIVE UPLOAD TEST")
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"🔍 File details:")
        print(f"   Name: {image_file.filename}")
        print(f"   Content Type: {image_file.content_type}")
        print(f"   Content Length: {image_file.content_length}")
        print(f"   Allowed: {allowed_file(image_file.filename)}")
        
        if not allowed_file(image_file.filename):
            return jsonify({'error': f'File type not allowed: {image_file.filename}'}), 400
        
        # Test if file is readable
        file_data = image_file.read()
        print(f"🔍 File data size: {len(file_data)} bytes")
        
        # Reset file pointer
        image_file.seek(0)
        
        # Test Google Drive upload
        print("🚀 Attempting Google Drive upload...")
        try:
            upload_result = drive_service.upload_image(image_file)
            print(f"✅ Google Drive upload successful!")
            print(f"   File ID: {upload_result['file_id']}")
            print(f"   Direct URL: {upload_result['direct_url']}")
            
            return jsonify({
                'success': True,
                'message': 'Google Drive upload successful',
                'data': upload_result
            }), 200
            
        except Exception as upload_error:
            print(f"❌ Google Drive upload failed: {str(upload_error)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Google Drive upload failed: {str(upload_error)}'}), 500
            
    except Exception as e:
        print(f"💥 Debug upload failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/products', methods=['POST'])
@jwt_required()
def create_vendor_product():
    print(f"🎯 PRODUCT CREATION REQUEST")
    print(f"📨 Content-Type: {request.content_type}")
    print(f"📨 Files: {list(request.files.keys())}")
    
    try:
        user_id = get_jwt_identity()
        vendor = Vendor.query.filter_by(user_id=user_id).first()
        
        if not vendor or vendor.status != VendorStatus.APPROVED:
            return jsonify({'error': 'Only approved vendors can create products'}), 403
        
        data = {}
        uploaded_images = []
        
        # Handle form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = {
                'name': request.form.get('name'),
                'price': request.form.get('price'),
                'stock': request.form.get('stock'),
                'description': request.form.get('description'),
                'category': request.form.get('category'),
                'is_active': request.form.get('is_active', 'true').lower() == 'true'
            }
            
            print(f"🔍 Form data: {data}")
            
            # Handle ALL possible image fields
            for field_name in ['images', 'image']:
                if field_name in request.files:
                    image_files = request.files.getlist(field_name)
                    print(f"🔍 Found {len(image_files)} files in '{field_name}' field")
                    
                    for i, image_file in enumerate(image_files):
                        if image_file and image_file.filename != '':
                            print(f"🔍 Processing {field_name} {i+1}: {image_file.filename}")
                            
                            if allowed_file(image_file.filename):
                                try:
                                    print(f"🔄 Uploading to Google Drive...")
                                    upload_result = drive_service.upload_image(image_file)
                                    uploaded_images.append(upload_result['direct_url'])
                                    print(f"✅ Upload successful: {upload_result['direct_url']}")
                                except Exception as upload_error:
                                    print(f"❌ Upload failed: {upload_error}")
                                    # Continue with other images
                            else:
                                print(f"⚠️ File type not allowed: {image_file.filename}")
        
        # Validate required fields
        required_fields = ['name', 'price', 'stock', 'description', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Find category
        category = Category.query.filter_by(name=data['category']).first()
        if not category:
            return jsonify({'error': f'Category "{data["category"]}" not found'}), 404
        
        print(f"🔍 Creating product with data: {data}")
        print(f"🔍 Images to be saved: {uploaded_images}")
        
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
        
        # Set images
        if uploaded_images:
            product.image_list = uploaded_images
            print(f"📸 Product images saved: {uploaded_images}")
        else:
            print("⚠️ No images were uploaded")
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
            
    except Exception as e:
        db.session.rollback()
        print(f"💥 Product creation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create product', 'message': str(e)}), 500

# @vendors_bp.route('/products/<int:product_id>', methods=['PUT'])
# @jwt_required()
# def update_vendor_product(product_id):
#     """Update a product for the current vendor"""
#     user_id = get_jwt_identity()
#     vendor = Vendor.query.filter_by(user_id=user_id).first()
    
#     if not vendor:
#         return jsonify({'error': 'Vendor profile not found'}), 404
    
#     if vendor.status != VendorStatus.APPROVED:
#         return jsonify({'error': 'Vendor not approved'}), 403
    
#     product = Product.query.filter_by(id=product_id, vendor_id=vendor.id).first()
#     if not product:
#         return jsonify({'error': 'Product not found or access denied'}), 404
    
#     # Handle form data or JSON
#     if request.content_type.startswith('multipart/form-data'):
#         data = {}
#         for key in request.form:
#             data[key] = request.form.get(key)
        
#         # Handle image upload
#         if 'images' in request.files:
#             image_files = request.files.getlist('images')
#             image_paths = []
#             for image_file in image_files:
#                 if image_file and allowed_file(image_file.filename):
#                     filename = secure_filename(image_file.filename)
#                     image_path = os.path.join('uploads', 'products', filename)
#                     os.makedirs(os.path.dirname(image_path), exist_ok=True)
#                     image_file.save(image_path)
#                     image_paths.append(f'/static/{image_path}')
            
#             if image_paths:
#                 # Convert list to JSON string or handle based on your DB structure
#                 data['images'] = json.dumps(image_paths)
#     else:
#         data = request.get_json()
    
#     try:
#         # Update product fields
#         if 'name' in data:
#             product.name = data['name']
#         if 'description' in data:
#             product.description = data['description']
#         if 'price' in data:
#             product.price = Decimal(str(data['price']))
#         if 'stock' in data:
#             product.stock = int(data['stock'])
#         if 'category' in data:
#             # FIX: Find the Category instance by name, don't assign string directly
#             category_name = data['category']
#             category = Category.query.filter_by(name=category_name).first()
#             if category:
#                 product.category_id = category.id  # Assign the foreign key ID
#             else:
#                 return jsonify({'error': f'Category "{category_name}" not found'}), 400
#         if 'is_active' in data:
#             product.is_active = data['is_active'].lower() == 'true' if isinstance(data['is_active'], str) else bool(data['is_active'])
#         if 'images' in data:
#             # Handle images based on your database structure
#             # If images is stored as JSON string, parse it
#             if isinstance(data['images'], str):
#                 try:
#                     product.images = json.loads(data['images'])
#                 except json.JSONDecodeError:
#                     product.images = [data['images']]
#             else:
#                 product.images = data['images']
        
#         db.session.commit()
        
#         return jsonify({
#             'message': 'Product updated successfully',
#             'product': product.to_dict()
#         }), 200
        
#     except Exception as e:
#         db.session.rollback()
#         import traceback
#         traceback.print_exc()  # This will help with debugging
#         return jsonify({'error': 'Product update failed', 'message': str(e)}), 500

@vendors_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_vendor_product(product_id):
    """Update a product for the current vendor with Google Drive support"""
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
        data = {}
        new_images = []
        current_images = product.image_list or []
        
        # Handle form data or JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Process form data
            for key in request.form:
                data[key] = request.form.get(key)
            
            # Handle new image uploads to Google Drive
            if 'images' in request.files:
                image_files = request.files.getlist('images')
                for image_file in image_files:
                    if image_file and image_file.filename != '' and allowed_file(image_file.filename):
                        try:
                            upload_result = drive_service.upload_image(image_file)
                            new_images.append(upload_result['direct_url'])
                            print(f"✅ New image uploaded to Google Drive: {upload_result['direct_url']}")
                        except Exception as upload_error:
                            print(f"❌ Failed to upload image to Google Drive: {str(upload_error)}")
                            continue
            
            # Handle image removal
            if 'remove_images' in data:
                try:
                    remove_indices = [int(i) for i in data['remove_images'].split(',')]
                    current_images = [img for i, img in enumerate(current_images) if i not in remove_indices]
                except ValueError:
                    print("⚠️ Invalid remove_images format")
                    
        elif request.is_json:
            # JSON data handling
            data = request.get_json()
            if 'images' in data:
                new_images = data['images'] if isinstance(data['images'], list) else [data['images']]
        
        # Update product fields
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = float(data['price'])
        if 'stock' in data:
            product.stock = int(data['stock'])
        if 'category' in data:
            category_name = data['category']
            category = Category.query.filter_by(name=category_name).first()
            if category:
                product.category_id = category.id
            else:
                return jsonify({'error': f'Category "{category_name}" not found'}), 400
        if 'is_active' in data:
            product.is_active = data['is_active'].lower() == 'true' if isinstance(data['is_active'], str) else bool(data['is_active'])
        
        # Update images - combine existing (minus removed) with new images
        if new_images or current_images != (product.image_list or []):
            final_images = current_images + new_images
            product.image_list = final_images
            print(f"📸 Updated product images: {final_images}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Product update failed', 'message': str(e)}), 500

# # Add a new route for standalone image upload
@vendors_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image(self, file_storage, filename=None):
    """Upload a Flask FileStorage object to Google Drive"""
    try:
        print("🚀 STARTING GOOGLE DRIVE UPLOAD PROCESS")
        
        if not filename:
            filename = file_storage.filename
        
        print(f"🔍 Upload details:")
        print(f"   Original filename: {filename}")
        print(f"   MIME type: {file_storage.mimetype}")
        print(f"   Content type: {file_storage.content_type}")
        
        # Check if service is available
        if not self.service:
            raise Exception("Google Drive service not initialized")
        
        # Test file reading
        current_pos = file_storage.tell()
        print(f"🔍 File stream position: {current_pos}")
        
        file_data = file_storage.read()
        print(f"🔍 File data read: {len(file_data)} bytes")
        
        if len(file_data) == 0:
            raise Exception("File is empty - no data could be read")
        
        # Reset file pointer
        file_storage.seek(0)
        file_stream = io.BytesIO(file_data)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
        unique_filename = f"product_{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        print(f"📤 Generated unique filename: {unique_filename}")
        
        # Create file metadata
        file_metadata = {
            'name': unique_filename,
            'parents': [self.folder_id]
        }
        
        print(f"🔍 File metadata: {file_metadata}")
        
        # Create media upload
        media = MediaIoBaseUpload(
            file_stream, 
            mimetype=file_storage.mimetype,
            resumable=False  # Change to False for simpler debugging
        )
        
        print("🔍 Starting Google Drive API call...")
        
        # Upload file
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink, mimeType, size'
        ).execute()

        print(f"✅ File uploaded to Google Drive!")
        print(f"   File ID: {file.get('id')}")
        print(f"   File Name: {file.get('name')}")

        # Make file publicly accessible
        print("🔍 Setting file permissions...")
        self.service.permissions().create(
            fileId=file.get('id'),
            body={
                'role': 'reader',
                'type': 'anyone'
            }
        ).execute()

        print("✅ File permissions set to public")

        # Return direct view URL
        direct_url = f"https://drive.google.com/uc?export=view&id={file.get('id')}"
        
        result = {
            'file_id': file.get('id'),
            'direct_url': direct_url,
            'web_view_link': file.get('webViewLink'),
            'file_name': file.get('name'),
            'original_filename': filename
        }
        
        print(f"🎉 UPLOAD SUCCESSFUL!")
        print(f"   Direct URL: {direct_url}")
        
        return result

    except Exception as e:
        print(f"💥 GOOGLE DRIVE UPLOAD FAILED: {str(e)}")
        import traceback
        print("🔍 Full traceback:")
        traceback.print_exc()
        raise Exception(f"Failed to upload to Google Drive: {str(e)}")

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