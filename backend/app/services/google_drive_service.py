# app/services/google_drive_service.py
import os
import io
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from flask import current_app
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class GoogleDriveService:
    def __init__(self):
        self.folder_id = '1JXV9HEI4lNONpWDnUtDl2Y0tcV7Gah9Q'
        self.service = self._authenticate()

    def _authenticate(self):
        try:
            # Path to your service account JSON key file
            # creds_file = '/backend/atomic-oven-476812-a3-4f8f0c1dcb05.json'
            creds_file = os.path.join(os.getcwd(), '', 'atomic-oven-476812-a3-4f8f0c1dcb05.json')

            
            if not os.path.exists(creds_file):
                raise FileNotFoundError(f"Service account key file not found: {creds_file}")

            credentials = service_account.Credentials.from_service_account_file(
                creds_file,
                scopes=['https://www.googleapis.com/auth/drive']
            )
            
            service = build('drive', 'v3', credentials=credentials)
            logger.info("✅ Google Drive service authenticated successfully")
            return service
            
        except Exception as e:
            logger.error(f"❌ Google Drive authentication failed: {str(e)}")
            raise

    def upload_image(self, file_storage, filename=None):
        """Upload a Flask FileStorage object to Google Drive"""
        try:
            if not filename:
                filename = file_storage.filename
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"product_{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            logger.info(f"📤 Uploading to Google Drive: {unique_filename}")
            
            # Read file data
            file_data = file_storage.read()
            file_stream = io.BytesIO(file_data)
            
            # Create file metadata
            file_metadata = {
                'name': unique_filename,
                'parents': [self.folder_id]
            }
            
            # Create media upload
            media = MediaIoBaseUpload(
                file_stream, 
                mimetype=file_storage.mimetype, 
                resumable=True
            )
            
            # Upload file
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink, mimeType'
            ).execute()

            logger.info(f"✅ File uploaded to Google Drive: {file.get('id')}")

            # Make file publicly accessible
            self.service.permissions().create(
                fileId=file.get('id'),
                body={
                    'role': 'reader',
                    'type': 'anyone'
                }
            ).execute()

            logger.info("✅ File permissions set to public")

            # Return direct view URL
            direct_url = f"https://drive.google.com/uc?export=view&id={file.get('id')}"
            
            return {
                'file_id': file.get('id'),
                'direct_url': direct_url,
                'web_view_link': file.get('webViewLink'),
                'file_name': file.get('name'),
                'original_filename': filename
            }

        except Exception as e:
            logger.error(f"❌ Google Drive upload error: {str(e)}")
            raise Exception(f"Failed to upload to Google Drive: {str(e)}")

    def delete_image(self, file_id):
        try:
            self.service.files().delete(fileId=file_id).execute()
            logger.info(f"✅ File deleted from Google Drive: {file_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Google Drive delete error: {str(e)}")
            raise