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
        # 🔥 REPLACE THIS WITH YOUR SHARED DRIVE ID
        # Current folder_id is a personal folder - service accounts can't use this!
        self.shared_drive_id = 'YOUR_SHARED_DRIVE_ID_HERE'  # ← MUST BE A SHARED DRIVE ID
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
        """Upload a Flask FileStorage object to Google Drive SHARED DRIVE"""
        try:
            if not filename:
                filename = file_storage.filename
            
            print(f"🚀 Uploading to Shared Drive: {filename}")
            print(f"📁 Shared Drive ID: {self.shared_drive_id}")
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"product_{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            # Read file data
            file_data = file_storage.read()
            file_stream = io.BytesIO(file_data)
            
            # Create file metadata for SHARED DRIVE
            file_metadata = {
                'name': unique_filename,
                'parents': [self.shared_drive_id]  # This MUST be a Shared Drive ID
            }
            
            # Upload file to SHARED DRIVE
            media = MediaIoBaseUpload(file_stream, mimetype=file_storage.mimetype)
            
            # 🔥 CRITICAL: Add supportsAllDrives=True for Shared Drives
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink, mimeType',
                supportsAllDrives=True  # 🔑 REQUIRED FOR SHARED DRIVES
            ).execute()

            print(f"✅ File uploaded to Shared Drive: {file.get('id')}")

            # Make file publicly accessible
            # 🔥 CRITICAL: Add supportsAllDrives=True for permissions too
            self.service.permissions().create(
                fileId=file.get('id'),
                body={'role': 'reader', 'type': 'anyone'},
                supportsAllDrives=True  # 🔑 REQUIRED FOR SHARED DRIVES
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
            print(f"❌ Upload to Shared Drive failed: {str(e)}")
            raise

    def delete_image(self, file_id):
        try:
            # 🔥 Add supportsAllDrives for delete operations too
            self.service.files().delete(
                fileId=file_id,
                supportsAllDrives=True  # 🔑 REQUIRED FOR SHARED DRIVES
            ).execute()
            print(f"✅ File deleted: {file_id}")
            return True
        except Exception as e:
            print(f"❌ Delete failed: {str(e)}")
            raise

    def test_shared_drive_access(self):
        """Test if we can access the Shared Drive"""
        try:
            print(f"🧪 Testing Shared Drive access: {self.shared_drive_id}")
            
            # List files in the Shared Drive
            results = self.service.files().list(
                corpora='drive',
                driveId=self.shared_drive_id,
                includeItemsFromAllDrives=True,
                supportsAllDrives=True,
                pageSize=5,
                fields="files(id, name)"
            ).execute()
            
            files = results.get('files', [])
            print(f"✅ Shared Drive access successful! Found {len(files)} files")
            return {
                'success': True,
                'file_count': len(files),
                'files': files
            }
            
        except Exception as e:
            print(f"❌ Shared Drive access failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }