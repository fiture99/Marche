# test_product_creation.py
import requests
import json

def test_product_creation():
    print("🧪 TESTING PRODUCT CREATION WITH IMAGE UPLOAD")
    print("=" * 50)
    
    # You'll need a valid JWT token for this test
    # Replace with your actual token or get one by logging in first
    token = "YOUR_JWT_TOKEN_HERE"
    
    if token == "YOUR_JWT_TOKEN_HERE":
        print("⚠️  Please set a valid JWT token in the script")
        return
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Test data
    product_data = {
        'name': 'Test Product from Drive',
        'price': '29.99',
        'stock': '10',
        'description': 'Test product with Google Drive image',
        'category': 'Electronics',  # Make sure this category exists
        'is_active': 'true'
    }
    
    # Test image
    test_image_path = 'test_image.jpg'
    
    try:
        print("🔍 Creating product with image upload...")
        
        with open(test_image_path, 'rb') as f:
            files = {
                'image': (test_image_path, f, 'image/jpeg'),
                'name': (None, product_data['name']),
                'price': (None, product_data['price']),
                'stock': (None, product_data['stock']),
                'description': (None, product_data['description']),
                'category': (None, product_data['category']),
                'is_active': (None, product_data['is_active'])
            }
            
            response = requests.post(
                'http://localhost:5000/api/vendors/products',
                files=files,
                headers=headers
            )
        
        print(f"📨 Response Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("🎉 PRODUCT CREATION SUCCESSFUL!")
            print(f"✅ Message: {result.get('message')}")
            print(f"📦 Product: {result.get('product', {}).get('name')}")
            print(f"🖼️  Images: {result.get('product', {}).get('images', [])}")
            
            # Check if images are Google Drive URLs
            images = result.get('product', {}).get('images', [])
            if images:
                for img_url in images:
                    if 'drive.google.com' in img_url:
                        print(f"✅ Image stored in Google Drive: {img_url}")
                    else:
                        print(f"❓ Image URL: {img_url}")
                        
        else:
            print(f"❌ Product creation failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"💥 Test failed: {e}")

if __name__ == '__main__':
    test_product_creation()