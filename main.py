import pandas as pd
import sqlite3
import gspread
from google.oauth2.service_account import Credentials
from google.cloud import storage  # Import storage for downloading credentials
import traceback

def download_credentials():
    try:
        print("Downloading credentials from Cloud Storage...")
        client = storage.Client()
        bucket = client.get_bucket('srj_website_database_credentials')  # Replace with srj bucket name
        blob = bucket.blob('credentials.json')
        blob.download_to_filename('credentials.json')  
        print("Credentials downloaded successfully.")
        return 'credentials.json'
    except Exception as e:
        print("Error downloading credentials:", e)
        traceback.print_exc()
        return None

def get_sheet_data(sheet_id, sheet_name):
    try:
        print("Fetching data from Google Sheets...")
        SCOPES = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
        client = gspread.authorize(creds)
        sheet = client.open_by_key(sheet_id).worksheet(sheet_name)
        print(f"Successfully accessed worksheet: {sheet_name}")
        data = sheet.get_all_values()
        headers = data[0]  # First row is header
        rows = data[1:]    # Rest is data
        return pd.DataFrame(rows, columns=headers)
    except Exception as e:
        print("Detailed error accessing Google Sheets:", e)
        traceback.print_exc()
        return None

def format_image_links(data):
    """
    Format the ImageLink column to match the correct format.
    """
    try:
        print("Formatting ImageLink column...")
        if 'ImageLink' in data.columns:
            data['ImageLink'] = data['ImageLink'].apply(lambda x: ','.join(
                [link.replace('https://storage.cloud.google.com', 'https://storage.googleapis.com') for link in x.split(',')] if isinstance(x, str) else []
            ))
            print("ImageLink column formatted successfully.")
        else:
            print("ImageLink column not found in data.")
    except Exception as e:
        print("Error formatting ImageLink column:", e)
        traceback.print_exc()

def update_database(request=None):
    print("Cloud Function triggered. Starting database update...")
    try:
        # Machines table update
        sheet_id = "1IvpK5kNDyWfB5HE8BajiU1NWJCuWEf5vP4qinitD_s8"
        sheet_name = "Test_CAT"

        # Load data from Google Sheets for machines
        data = get_sheet_data(sheet_id, sheet_name)
        if data is None:
            print("Failed to fetch data from Google Sheets.")
            return "Data could not be loaded from Google Sheets.", 500

        print("Data fetched successfully:")
        print(data.head())

        # Clean and format data
        data.columns = ['MMake', 'MModel', 'Tsize', 'Thread', 'ImageLink']
        data.drop_duplicates(inplace=True)

        # Format the ImageLink column
        format_image_links(data)

        # Connect to SQLite database
        print("Connecting to SQLite database...")
        conn = sqlite3.connect('MMM_db.db')  
        cursor = conn.cursor()

        # Drop the old table
        print("Dropping old 'machines' table (if exists)...")
        cursor.execute('DROP TABLE IF EXISTS machines')
        conn.commit()

        # Create new table with ImageLink column
        print("Creating new 'machines' table...")
        cursor.execute('''
            CREATE TABLE machines (
                MMake TEXT,
                MModel TEXT,
                Tsize TEXT,
                Thread TEXT,
                ImageLink TEXT,
                PRIMARY KEY (MMake, MModel, Tsize, Thread)
            )
        ''')
        print("New table created.")

        # Insert new data into the database
        print("Inserting new data into 'machines' table...")
        data.to_sql('machines', conn, if_exists='append', index=False)

        # Category table update
        category_sheet_name = "Category"  # Sheet name for the Category table

        # Load data from Google Sheets for categories
        category_data = get_sheet_data(sheet_id, category_sheet_name)
        if category_data is None:
            print("Failed to fetch category data from Google Sheets.")
            return "Category data could not be loaded from Google Sheets.", 500

        print("Category data fetched successfully:")
        print(category_data.head())

        # Clean and format category data
        category_data.columns = ['C_name']
        category_data.drop_duplicates(inplace=True)

        # Drop the old Category table
        print("Dropping old 'Category' table (if exists)...")
        cursor.execute('DROP TABLE IF EXISTS Category')
        conn.commit()

        # Create new Category table
        print("Creating new 'Category' table...")
        cursor.execute('''
            CREATE TABLE Category (
                C_name TEXT PRIMARY KEY
            )
        ''')
        print("New 'Category' table created.")

        # Insert new category data into the database
        print("Inserting new data into 'Category' table...")
        category_data.to_sql('Category', conn, if_exists='append', index=False)

        conn.commit()
        conn.close()

        print("Database update done.")
        return "Database update done", 200
    except Exception as e:
        print("Error occurred during database update:", e)
        traceback.print_exc()
        return str(e), 500

if __name__ == "__main__":
    print("Running locally...")
    update_database(None)
