# app/services/s3_storage_service.py
import boto3
import uuid
from datetime import datetime
import os
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

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
            print(f"✅ S3 Storage initialized successfully - Bucket: {self.bucket_name}")
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                raise Exception(f"S3 bucket '{self.bucket_name}' not found")
            elif error_code == '403':
                raise Exception(f"Access denied to S3 bucket '{self.bucket_name}'")
            else:
                raise Exception(f"S3 connection failed: {str(e)}")
        except Exception as e:
            raise Exception(f"S3 initialization failed: {str(e)}")
    
    def upload_image(self, file_storage, filename=None):
        """Upload image to S3 and return public URL"""
        try:
            if not filename:
                filename = file_storage.filename
            
            print(f"🚀 Uploading to S3: {filename}")
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"products/{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            # Upload to S3
            self.s3_client.upload_fileobj(
                file_storage,
                self.bucket_name,
                unique_filename,
                ExtraArgs={
                    'ContentType': file_storage.content_type or 'image/jpeg',
                    'ACL': 'public-read'  # Make file publicly accessible
                }
            )
            
            # Generate public URL
            image_url = f"https://{self.bucket_name}.s3.{os.environ.get('AWS_REGION', 'us-east-1')}.amazonaws.com/{unique_filename}"
            
            print(f"✅ S3 upload successful: {image_url}")
            
            return {
                'file_id': unique_filename,
                'direct_url': image_url,
                'web_view_link': image_url,
                'file_name': filename,
                's3_key': unique_filename
            }
            
        except Exception as e:
            print(f"❌ S3 upload failed: {str(e)}")
            raise
    
    def delete_image(self, file_id):
        """Delete image from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_id
            )
            print(f"✅ S3 file deleted: {file_id}")
            return True
        except Exception as e:
            print(f"❌ S3 delete failed: {str(e)}")
            raise
    
    def test_connection(self):
        """Test S3 connection and permissions"""
        try:
            # Test bucket access
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            
            # Test upload permissions with a small test
            test_key = f"test_connection_{uuid.uuid4().hex[:8]}.txt"
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=test_key,
                Body=b'test',
                ACL='public-read'
            )
            
            # Clean up test file
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=test_key
            )
            
            return {
                'success': True,
                'message': f'S3 connection successful - Bucket: {self.bucket_name}',
                'bucket_name': self.bucket_name,
                'region': os.environ.get('AWS_REGION', 'us-east-1')
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'bucket_name': self.bucket_name
            }

# Initialize S3 service
s3_storage_service = S3StorageService()