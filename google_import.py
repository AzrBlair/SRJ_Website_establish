import pandas as pd
import sqlite3
import gspread
from google.oauth2.service_account import Credentials
import traceback

# Set up Google Sheets API credentials with correct scopes
def get_sheet_data(sheet_id, sheet_name):
    try:
        # Define the correct scopes for Google Sheets and Google Drive access
        SCOPES = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]

        # Load credentials with the specified scopes
        creds = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
        client = gspread.authorize(creds)

        try:
            # Access the Google Sheet by ID
            sheet = client.open_by_key("1J1zLo6J5YwJkQvGS8EYGz7uTloH1FoxLdpVJrkz2xL8")
            worksheets = sheet.worksheets()
            print("Worksheets available in the Google Sheet:")
            for ws in worksheets:
                print(ws.title)  # Print the names of all worksheets to verify
        except Exception as e:
            print("Error accessing Google Sheets:", e)

        # Access the Google Sheet using its ID
        sheet = client.open_by_key(sheet_id).worksheet(sheet_name)
        
        # Debugging print statement
        print("Successfully accessed worksheet:", sheet_name)
        
        data = sheet.get_all_values()
        headers = data[0]  # Assuming first row is header
        rows = data[1:]    # Rest is data
        return pd.DataFrame(rows, columns=headers)
    except Exception as e:
        print("Detailed error accessing Google Sheets:", e)
        traceback.print_exc()
        return None

# Load data from Google Sheets
sheet_id = "1IvpK5kNDyWfB5HE8BajiU1NWJCuWEf5vP4qinitD_s8"  # Sheet ID only
sheet_name = "Test_CAT"  # Exact name of the worksheet (tab)
data = get_sheet_data(sheet_id, sheet_name)

# Check if data was successfully retrieved
if data is not None:
    print("Data successfully loaded:")
    print(data.head())  # Print the first few rows for confirmation
else:
    print("Data could not be loaded from Google Sheets.")

# Check if data was successfully retrieved
if data is not None:
    # Clean and format data
    data.columns = ['MMake', 'MModel', 'Tsize']  # Rename columns to match database schema
    data.drop_duplicates(inplace=True)           # Remove duplicate rows if necessary

    # Connect to SQLite database (or create it if it doesn't exist)
    conn = sqlite3.connect('MMM_db.db')
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

    # Load existing data in database
    existing_data = pd.read_sql_query("SELECT * FROM machines", conn)

    # Find new rows to add
    new_rows = data[~data.isin(existing_data)].dropna()

    # Find rows to delete (present in DB but not in the updated Excel file)
    rows_to_delete = existing_data[~existing_data.isin(data)].dropna()

    # Insert new rows
    new_rows.to_sql('machines', conn, if_exists='append', index=False)

    # Delete rows that are no longer in the Excel file
    for index, row in rows_to_delete.iterrows():
        cursor.execute('DELETE FROM machines WHERE MMake=? AND MModel=? AND Tsize=?', (row['MMake'], row['MModel'], row['Tsize']))

    conn.commit()  # Save changes
    conn.close()   # Close database connection

    print("done")
else:
    print("Data could not be loaded from Google Sheets.")