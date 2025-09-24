# Marché Backend API

Flask-based REST API for the Marché multi-vendor e-commerce platform.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Customer, vendor, and admin user types
- **Vendor System**: Vendor applications, approvals, and management
- **Product Management**: CRUD operations for products with categories
- **Order System**: Complete order processing with cart functionality
- **Admin Panel**: Administrative controls for platform management

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL
- pip

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/marche_db
   JWT_SECRET_KEY=your-super-secret-jwt-key
   FLASK_ENV=development
   SECRET_KEY=your-flask-secret-key
   ```

5. **Database Setup**
   ```bash
   # Create database
   createdb marche_db
   
   # Initialize migrations
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   
   # Seed with sample data
   python seed_data.py
   ```

6. **Run the application**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Vendors
- `POST /api/vendors/apply` - Apply as vendor
- `GET /api/vendors` - List approved vendors
- `GET /api/vendors/<id>` - Get vendor details
- `GET /api/vendors/my-vendor` - Get current user's vendor profile
- `PUT /api/vendors/my-vendor` - Update vendor profile
- `GET /api/vendors/<id>/products` - Get vendor's products

### Products
- `GET /api/products` - List products (with filtering)
- `GET /api/products/<id>` - Get product details
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/<id>` - Update product (vendor only)
- `DELETE /api/products/<id>` - Delete product (vendor only)
- `GET /api/products/my-products` - Get vendor's products

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/<id>` - Get category details
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/<id>` - Update category (admin only)
- `DELETE /api/categories/<id>` - Delete category (admin only)

### Orders & Cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/<id>` - Get order details
- `PUT /api/orders/<id>/cancel` - Cancel order
- `GET /api/orders/cart` - Get cart items
- `POST /api/orders/cart/add` - Add to cart
- `PUT /api/orders/cart/<id>` - Update cart item
- `DELETE /api/orders/cart/<id>` - Remove from cart
- `DELETE /api/orders/cart/clear` - Clear cart

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/vendors` - List all vendors
- `PUT /api/admin/vendors/<id>/approve` - Approve vendor
- `PUT /api/admin/vendors/<id>/reject` - Reject vendor
- `PUT /api/admin/vendors/<id>/suspend` - Suspend vendor
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/<id>/status` - Update order status
- `GET /api/admin/products` - List all products
- `PUT /api/admin/products/<id>/toggle-active` - Toggle product status
- `GET /api/admin/users` - List all users

## Database Models

### User
- Authentication and profile information
- Role-based access (customer, vendor, admin)

### Vendor
- Vendor profile and business information
- Application status tracking

### Product
- Product details with images and pricing
- Stock management and categorization

### Category
- Product categorization system

### Order & OrderItem
- Complete order processing
- Order status tracking

### CartItem
- Shopping cart functionality

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Development

### Database Migrations

```bash
# Create migration
flask db migrate -m "Description of changes"

# Apply migration
flask db upgrade

# Downgrade migration
flask db downgrade
```

### Testing

```bash
# Run tests (when implemented)
python -m pytest
```

## Deployment

The application is ready for deployment on platforms like:
- Heroku
- Render
- AWS
- DigitalOcean

Make sure to set environment variables and configure PostgreSQL database in production.