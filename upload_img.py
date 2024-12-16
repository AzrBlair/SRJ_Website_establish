from google.cloud import storage
import os
import sqlite3

def upload_images_to_gcs(bucket_name, source_folder, destination_folder):
    try:
        print("Initializing Google Cloud Storage client...")
        client = storage.Client()
        bucket = client.bucket(bucket_name)

        # Walk through the local directory and upload files
        for root, _, files in os.walk(source_folder):
            for file_name in files:
                if file_name.endswith(('.jpg', '.png')):  # Ensure only image files are uploaded
                    source_file_path = os.path.join(root, file_name)
                    destination_blob_name = os.path.join(destination_folder, file_name)

                    blob = bucket.blob(destination_blob_name)
                    blob.upload_from_filename(source_file_path)

                    print(f"Uploaded {file_name} to {destination_blob_name}")
        print("All images uploaded successfully!")
    except Exception as e:
        print("Error during image upload:", e)

# Upload images to the bucket
bucket_name = "srj_website_database_credentials"  # Replace with your bucket name
source_folder = "C:\Users\srj-39sp\Desktop\website_img\CAT"  # Replace with your local folder path
destination_folder = "srj_website_database_credentials"

upload_images_to_gcs(bucket_name, source_folder, destination_folder)
