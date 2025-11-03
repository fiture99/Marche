# app/services/s3_storage_service.py
import boto3
import uuid
from datetime import datetime
import os
from botocore.exceptions import ClientError

class S3StorageService:
    def __init__(self):
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
                region_name=os.environ.get('AWS_REGION', 'us-east-1')
            )
            self.bucket_name = os.environ.get('AWS_S3_BUCKET')
            
            # Test connection
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            print(f"✅ S3 Storage initialized - Bucket: {self.bucket_name}")
            
        except Exception as e:
            print(f"❌ S3 initialization failed: {str(e)}")
            raise
    
    def upload_image(self, file_storage, filename=None):
        """Upload image to S3 - works with bucket policy (no ACLs)"""
        try:
            if not filename:
                filename = file_storage.filename
            
            print(f"🚀 Uploading to S3: {filename}")
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"products/{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            # Upload WITHOUT ACL - bucket policy handles permissions
            self.s3_client.upload_fileobj(
                file_storage,
                self.bucket_name,
                unique_filename,
                ExtraArgs={
                    'ContentType': file_storage.content_type or 'image/jpeg'
                }
            )
            
            # Generate public URL
            image_url = f"https://{self.bucket_name}.s3.amazonaws.com/{unique_filename}"
            
            print(f"✅ S3 upload successful: {image_url}")
            
            return {
                'file_id': unique_filename,
                'direct_url': image_url,
                'web_view_link': image_url,
                'file_name': filename
            }
            
        except Exception as e:
            print(f"❌ S3 upload failed: {str(e)}")
            raise

# Initialize service
s3_storage_service = S3StorageService()