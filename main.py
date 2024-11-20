import pandas as pd
import sqlite3
import gspread
from google.oauth2.service_account import Credentials
from google.cloud import storage  # Import storage for downloading credentials
import traceback

# Function to download credentials from Google Cloud Storage
def download_credentials():
    try:
        print("Downloading credentials from Cloud Storage...")
        client = storage.Client()
        bucket = client.get_bucket('srj_website_database_credentials')  # Replace with your bucket name
        blob = bucket.blob('credentials.json')
        blob.download_to_filename('/tmp/credentials.json')  # Download to /tmp for use in Cloud Functions
        print("Credentials downloaded successfully.")
        return '/tmp/credentials.json'
    except Exception as e:
        print("Error downloading credentials:", e)
        traceback.print_exc()
        return None

# Set up Google Sheets API credentials with correct scopes
def get_sheet_data(sheet_id, sheet_name):
    try:
        print("Fetching data from Google Sheets...")
        # Download the credentials from Cloud Storage
        credentials_path = download_credentials()
        if not credentials_path:
            print("Failed to download credentials.")
            return None
        
        # Define the correct scopes for Google Sheets and Google Drive access
        SCOPES = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]

        # Load credentials with the specified scopes
        creds = Credentials.from_service_account_file(credentials_path, scopes=SCOPES)
        client = gspread.authorize(creds)

        # Access the Google Sheet using its ID
        sheet = client.open_by_key(sheet_id).worksheet(sheet_name)
        
        # Debugging print statement
        print(f"Successfully accessed worksheet: {sheet_name}")
        
        data = sheet.get_all_values()
        headers = data[0]  # Assuming first row is header
        rows = data[1:]    # Rest is data
        return pd.DataFrame(rows, columns=headers)
    except Exception as e:
        print("Detailed error accessing Google Sheets:", e)
        traceback.print_exc()
        return None

# Main function for Google Cloud Function
def update_database(request=None):
    print("Cloud Function triggered. Starting database update...")
    try:
        # Google Sheet information
        sheet_id = "1IvpK5kNDyWfB5HE8BajiU1NWJCuWEf5vP4qinitD_s8"
        sheet_name = "Test_CAT"
        
        # Load data from Google Sheets
        data = get_sheet_data(sheet_id, sheet_name)
        if data is None:
            print("Failed to fetch data from Google Sheets.")
            return "Data could not be loaded from Google Sheets.", 500

        print("Data fetched successfully:")
        print(data.head())  # Debugging: Print the first few rows

        # Clean and format data
        data.columns = ['MMake', 'MModel', 'Tsize']
        data.drop_duplicates(inplace=True)

        # Connect to SQLite database (or create it if it doesn't exist)
        print("Connecting to SQLite database...")
        conn = sqlite3.connect('/tmp/MMM_db.db')  # Use /tmp directory in cloud functions
        cursor = conn.cursor()

        # Create table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS machines (
                MMake TEXT,
                MModel TEXT,
                Tsize TEXT,
                PRIMARY KEY (MMake, MModel, Tsize)
            )
        ''')
        print("Database table ensured.")

        # Load existing data in database
        existing_data = pd.read_sql_query("SELECT * FROM machines", conn)
        print("Existing data in database:")
        print(existing_data)

        # Find new rows to add
        new_rows = data[~data.isin(existing_data)].dropna()
        print("New rows to add:")
        print(new_rows)

        # Find rows to delete
        rows_to_delete = existing_data[~existing_data.isin(data)].dropna()
        print("Rows to delete:")
        print(rows_to_delete)

        # Insert new rows
        new_rows.to_sql('machines', conn, if_exists='append', index=False)

        # Delete rows that are no longer in the Excel file
        for index, row in rows_to_delete.iterrows():
            cursor.execute('DELETE FROM machines WHERE MMake=? AND MModel=? AND Tsize=?', 
                           (row['MMake'], row['MModel'], row['Tsize']))

        conn.commit()  # Save changes
        conn.close()   # Close database connection

        print("Database update done.")
        return "Database update done", 200
    except Exception as e:
        print("Error occurred during database update:", e)
        traceback.print_exc()
        return str(e), 500

# Local testing
if __name__ == "__main__":
    print("Running locally...")
    update_database(None)