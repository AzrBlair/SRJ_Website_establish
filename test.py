from google.oauth2.service_account import Credentials
import gspread

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

credentials = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
client = gspread.authorize(credentials)

# Replace with your actual sheet ID and sheet name
sheet_id = "1IvpK5kNDyWfB5HE8BajiU1NWJCuWEf5vP4qinitD_s8"
sheet_name = "MMM"

credentials = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
request = Request()
credentials.refresh(request)
print("Access Token:", credentials.token)

try:
    sheet = client.open_by_key(sheet_id).worksheet(sheet_name)
    print(sheet.get_all_values())
except Exception as e:
    print("Error accessing Google Sheet:", e)