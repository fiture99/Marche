# test_drive_setup.py
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
import json

def test_drive_setup():
    print("🧪 COMPREHENSIVE GOOGLE DRIVE SETUP TEST")
    print("=" * 50)
    
    creds_file = 'atomic-oven-476812-a3-9d0435dabb98.json'
    folder_id = '1JXV9HEI4lNONpWDnUtDl2Y0tcV7Gah9Q'
    
    # Load credentials
    try:
        credentials = service_account.Credentials.from_service_account_file(
            creds_file,
            scopes=['https://www.googleapis.com/auth/drive']
        )
        print("✅ Credentials loaded successfully")
        print(f"📧 Service Account: {credentials.service_account_email}")
    except Exception as e:
        print(f"❌ Failed to load credentials: {e}")
        return
    
    # Build service
    try:
        service = build('drive', 'v3', credentials=credentials, cache_discovery=False)
        print("✅ Drive service built successfully")
    except Exception as e:
        print(f"❌ Failed to build service: {e}")
        return
    
    # Test 1: Basic about call
    try:
        about = service.about().get(fields="user,storageQuota").execute()
        print("✅ Basic API call successful")
        print(f"   👤 User: {about['user']['displayName']} ({about['user']['emailAddress']})")
        print(f"   💾 Storage: {about['storageQuota']}")
    except Exception as e:
        print(f"❌ Basic API call failed: {e}")
        return
    
    # Test 2: Check folder access
    try:
        folder = service.files().get(
            fileId=folder_id,
            fields='id, name, capabilities, permissions'
        ).execute()
        print(f"✅ Folder access successful")
        print(f"   📁 Folder Name: {folder.get('name', 'Unknown')}")
        print(f"   🔑 Folder ID: {folder.get('id')}")
        
        # Check permissions
        permissions = folder.get('permissions', [])
        service_account_email = credentials.service_account_email
        has_access = any(perm['emailAddress'] == service_account_email for perm in permissions)
        
        if has_access:
            print(f"   ✅ Service account has access to folder")
        else:
            print(f"   ❌ Service account DOES NOT have access to folder")
            print(f"   💡 Share the folder with: {service_account_email}")
            
    except Exception as e:
        print(f"❌ Folder access failed: {e}")
        print(f"   💡 This usually means:")
        print(f"   - The folder ID is incorrect")
        print(f"   - The service account doesn't have access")
        print(f"   - The folder doesn't exist")
        return
    
    # Test 3: List files in folder
    try:
        results = service.files().list(
            pageSize=5,
            q=f"'{folder_id}' in parents",
            fields="files(id, name, mimeType)"
        ).execute()
        files = results.get('files', [])
        print(f"✅ Can list folder contents: {len(files)} files found")
        for file in files:
            print(f"   📄 {file['name']} ({file['mimeType']})")
    except Exception as e:
        print(f"❌ Cannot list folder contents: {e}")
    
    print("=" * 50)
    print("🎯 NEXT STEPS:")
    print("1. If folder access failed, share the folder with the service account")
    print("2. If basic API call failed, check Google Drive API is enabled")
    print("3. If all tests pass, the upload should work")

if __name__ == '__main__':
    test_drive_setup()