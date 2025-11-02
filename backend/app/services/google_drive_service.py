# app/services/google_drive_service.py
import os
import io
import json
import base64
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class GoogleDriveService:
    def __init__(self):
        # Your actual Google Drive folder ID
        self.folder_id = '1fB0FMKrr0BV1XXeotqt6Ig6dSY-j8dQU'
        self.service = self._authenticate()

    def _authenticate(self):
        try:
            print("🔍 Starting Google Drive authentication...")
            
            # Primary method: Base64 encoded environment variable
            encoded_creds = os.environ.get('GOOGLE_DRIVE_CREDENTIALS_BASE64')
            if encoded_creds:
                print("✅ Found base64 encoded credentials")
                creds_json = base64.b64decode(encoded_creds).decode('utf-8')
                creds_info = json.loads(creds_json)
                credentials = service_account.Credentials.from_service_account_info(creds_info)
                print(f"✅ Loaded service account: {creds_info.get('client_email')}")
            
            # Fallback: JSON string environment variable
            elif os.environ.get('GOOGLE_DRIVE_CREDENTIALS_JSON'):
                print("✅ Found JSON credentials in environment variable")
                creds_json = os.environ.get('GOOGLE_DRIVE_CREDENTIALS_JSON')
                creds_info = json.loads(creds_json)
                credentials = service_account.Credentials.from_service_account_info(creds_info)
                print(f"✅ Loaded service account: {creds_info.get('client_email')}")
            
            # Development fallback: Local file
            else:
                print("⚠️  No environment variables found, checking for local file...")
                creds_file = 'atomic-oven-476812-a3-9d0435dabb98.json'
                if os.path.exists(creds_file):
                    print(f"✅ Using local credentials file: {creds_file}")
                    credentials = service_account.Credentials.from_service_account_file(
                        creds_file,
                        scopes=['https://www.googleapis.com/auth/drive']
                    )
                    
                else:
                    raise Exception(
                        "No Google Drive credentials found.\n"
                        "Please set GOOGLE_DRIVE_CREDENTIALS_BASE64 environment variable in Render."
                    )

            # Build the service
            service = build('drive', 'v3', credentials=credentials)
            print("✅ Google Drive service authenticated successfully")
            
            return service
            
        except Exception as e:
            print(f"❌ Google Drive authentication failed: {str(e)}")
            raise

    def upload_image(self, file_storage, filename=None):
        """Upload a Flask FileStorage object to Google Drive"""
        try:
            if not filename:
                filename = file_storage.filename
            
            print(f"🚀 Uploading to folder {self.folder_id}: {filename}")
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"product_{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            # Read file data
            file_data = file_storage.read()
            file_stream = io.BytesIO(file_data)
            
            # Create file metadata
            file_metadata = {
                'name': unique_filename,
                'parents': [self.folder_id]
            }
            
            # Upload file (NO supportsAllDrives for personal folders)
            media = MediaIoBaseUpload(file_stream, mimetype=file_storage.mimetype)
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink, mimeType'
                # No supportsAllDrives for personal folders
            ).execute()

            print(f"✅ File uploaded: {file.get('id')}")

            # Make file publicly accessible (NO supportsAllDrives for personal folders)
            self.service.permissions().create(
                fileId=file.get('id'),
                body={'role': 'reader', 'type': 'anyone'}
                # No supportsAllDrives for personal folders
            ).execute()

            print("✅ File permissions set to public")

            # Return direct view URL
            direct_url = f"https://drive.google.com/uc?export=view&id={file.get('id')}"
            
            return {
                'file_id': file.get('id'),
                'direct_url': direct_url,
                'web_view_link': file.get('webViewLink'),
                'file_name': file.get('name')
            }

        except Exception as e:
            print(f"❌ Upload failed: {str(e)}")
            raise

    def delete_image(self, file_id):
        try:
            self.service.files().delete(fileId=file_id).execute()
            print(f"✅ File deleted: {file_id}")
            return True
        except Exception as e:
            print(f"❌ Delete failed: {str(e)}")
            raise

    def test_folder_access(self):
        """Test if we can access the folder"""
        try:
            print(f"🧪 Testing folder access: {self.folder_id}")
            
            # Try to get folder info
            folder = self.service.files().get(
                fileId=self.folder_id,
                fields='id, name, mimeType'
            ).execute()
            
            print(f"✅ Folder access successful: {folder.get('name')}")
            return {
                'success': True,
                'folder_name': folder.get('name'),
                'folder_id': folder.get('id')
            }
            
        except Exception as e:
            print(f"❌ Folder access failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }