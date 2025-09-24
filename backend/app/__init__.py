# from flask import Flask
# from config import config
# import os

# # Import extensions from extensions module
# from app.extensions import db, migrate, jwt, ma
# from werkzeug.utils import secure_filename
# from flask_cors import CORS
# from flask import Flask, send_from_directory


# # Allowed file extensions for images
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# def allowed_file(filename):
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# # Make sure to create the uploads directory
# os.makedirs('uploads/products', exist_ok=True)

# def create_app(config_name=None):
#     if config_name is None:
#         config_name = os.environ.get('FLASK_ENV', 'default')
    
#     app = Flask(__name__)
#     app.config.from_object(config[config_name])
    
#     # Initialize extensions with app
#     db.init_app(app)
#     migrate.init_app(app, db)
#     jwt.init_app(app)
#     ma.init_app(app)
    
#     # ✅ Configure CORS properly
#     CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})
    
#     # Create upload directory
#     upload_dir = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
#     os.makedirs(upload_dir, exist_ok=True)
    
#     # Register blueprints
#     from app.routes.auth import auth_bp
#     from app.routes.products import products_bp
#     from app.routes.vendors import vendors_bp
#     from app.routes.orders import orders_bp
#     from app.routes.admin import admin_bp
#     from app.routes.categories import categories_bp
    
#     app.register_blueprint(auth_bp, url_prefix='/api/auth')
#     app.register_blueprint(products_bp, url_prefix='/api/products')
#     app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
#     app.register_blueprint(orders_bp, url_prefix='/api/orders')
#     app.register_blueprint(admin_bp, url_prefix='/api/admin')
#     app.register_blueprint(categories_bp, url_prefix='/api/categories')
    
#     # Health check endpoint
#     @app.route('/api/health')
#     def health_check():
#         return {'status': 'healthy', 'message': 'Marché API is running'}
    
#     # Auto-create tables if they don't exist
#     with app.app_context():
#         # Import models here to avoid circular imports
#         from app.models.user import User
#         from app.models.vendor import Vendor
#         from app.models.product import Product
#         from app.models.order import Order
#         from app.models.category import Category
        
#         db.create_all()

#     # ✅ Add static file serving with proper CORS headers
#     @app.route('/static/uploads/products/<path:filename>')
#     def serve_uploaded_file(filename):
#         upload_dir = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
#         response = send_from_directory(upload_dir, filename)
        
#         # Add CORS headers to static file responses
#         response.headers.add('Access-Control-Allow-Origin', app.config['CORS_ORIGINS'])
#         response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#         response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
#         return response
    
#     return app



from flask import Flask
from config import config
import os

# Import extensions from extensions module
from app.extensions import db, migrate, jwt, ma
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask import Flask, send_from_directory

# Allowed file extensions for images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def create_app(config_name=None):
#     if config_name is None:
#         config_name = os.environ.get('FLASK_ENV', 'default')
    
#     app = Flask(__name__)
#     app.config.from_object(config[config_name])
    
#     # ✅ Configure CORS properly - FIXED
#     # Use supports_credentials=True if you need cookies/auth
#     CORS(app, 
#          origins=app.config['CORS_ORIGINS'],
#          supports_credentials=True,
#          allow_headers=['Content-Type', 'Authorization'])
    
#     # Initialize extensions with app
#     db.init_app(app)
#     migrate.init_app(app, db)
#     jwt.init_app(app)
#     ma.init_app(app)
    
#     # Create upload directory
#     upload_dir = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
#     os.makedirs(upload_dir, exist_ok=True)
    
#     # Register blueprints
#     from app.routes.auth import auth_bp
#     from app.routes.products import products_bp
#     from app.routes.vendors import vendors_bp
#     from app.routes.orders import orders_bp
#     from app.routes.admin import admin_bp
#     from app.routes.categories import categories_bp
    
#     app.register_blueprint(auth_bp, url_prefix='/api/auth')
#     app.register_blueprint(products_bp, url_prefix='/api/products')
#     app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
#     app.register_blueprint(orders_bp, url_prefix='/api/orders')
#     app.register_blueprint(admin_bp, url_prefix='/api/admin')
#     app.register_blueprint(categories_bp, url_prefix='/api/categories')
    
#     # Health check endpoint
#     @app.route('/api/health')
#     def health_check():
#         return {'status': 'healthy', 'message': 'Marché API is running'}
    
#     # Auto-create tables if they don't exist
#     with app.app_context():
#         # Import models here to avoid circular imports
#         from app.models.user import User
#         from app.models.vendor import Vendor
#         from app.models.product import Product
#         from app.models.order import Order
#         from app.models.category import Category
        
#         db.create_all()

#     # ✅ Add static file serving with proper CORS headers
#     @app.route('/static/uploads/products/<path:filename>')
#     def serve_uploaded_file(filename):
#         upload_dir = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
#         response = send_from_directory(upload_dir, filename)
        
#         # Add CORS headers to static file responses
#         response.headers.add('Access-Control-Allow-Origin', ', '.join(app.config['CORS_ORIGINS']))
#         response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#         response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
#         return response

    
    
#     return app


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # ✅ Configure CORS properly - FIXED
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    
    # Create upload directory
    upload_dir = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
    os.makedirs(upload_dir, exist_ok=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.vendors import vendors_bp
    from app.routes.orders import orders_bp
    from app.routes.admin import admin_bp
    from app.routes.categories import categories_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Marché API is running'}
    
    # Auto-create tables if they don't exist
    with app.app_context():
        # Import models here to avoid circular imports
        from app.models.user import User
        from app.models.vendor import Vendor
        from app.models.product import Product
        from app.models.order import Order
        from app.models.category import Category
        
        db.create_all()

    # ✅ Add file serving for BOTH URL patterns
    @app.route('/uploads/products/<path:filename>')
    def serve_uploaded_file(filename):
        # Security check - prevent directory traversal
        if '..' in filename or filename.startswith('/'):
            return {"error": "Invalid filename"}, 400
        
        # Try multiple possible locations
        possible_dirs = [
            os.path.join(app.instance_path, 'uploads', 'products'),
            os.path.join(app.root_path, 'uploads', 'products'),
            os.path.join(os.getcwd(), 'uploads', 'products'),
            os.path.join(app.instance_path, 'static', 'uploads', 'products'),
        ]
        
        for upload_dir in possible_dirs:
            file_path = os.path.join(upload_dir, filename)
            if os.path.exists(file_path):
                # Add cache headers and CORS
                response = send_from_directory(upload_dir, filename)
                response.headers.add('Access-Control-Allow-Origin', ', '.join(app.config['CORS_ORIGINS']))
                response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
                response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
                response.headers.add('Cache-Control', 'max-age=3600')  # Cache for 1 hour
                
                return response
        
        # Log the missing file for debugging
        app.logger.warning(f"File not found: {filename}")
        app.logger.warning(f"Searched in directories: {possible_dirs}")
        
        return {"error": "File not found"}, 404
    
    return app