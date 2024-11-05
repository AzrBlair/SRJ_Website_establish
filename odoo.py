import ssl
from xmlrpc import client
import pandas as pd

# Odoo credentials and setup
url = 'https://192.168.0.15'  # Replace with your Odoo instance URL
db = 'srj_db'                  # Replace with your Odoo database name
username = 'admin'              # Replace with your Odoo username
password = '123456'             # Replace with your Odoo password

# Disable SSL certificate verification
context = ssl._create_unverified_context()

# Connect to Odoo
common = client.ServerProxy(f'{url}/xmlrpc/2/common', allow_none=True, context=context)
uid = common.authenticate(db, username, password, {})
models = client.ServerProxy(f'{url}/xmlrpc/2/object', allow_none=True, context=context)

# Load Excel files
file1 = r'\\SRJ-2012-SRV\SRJ Business Management System\SRJ Records\Sales & Marketing\Sales Brochures\Rubber Tracks\Rubber Track Price & Inventory List\Exc 2024\Rubber Track Price and Inventory 02-09-24.xlsx'
file2 = r'\\SRJ-2012-SRV\SRJ Business Management System\SRJ Records\Sales & Marketing\Sales Brochures\Machine Make & Model\Machine Model_3.xlsx'

# Load first Excel file (pricelist) with multi-level headers
excel1 = pd.ExcelFile(file1)
product_data = []

for sheet_name in excel1.sheet_names:
    df = excel1.parse(sheet_name, header=[0, 1])  # Specify two levels of headers
    
    # Check if 'Contrctor' and 'FOB' are in the columns before proceeding
    if ('Contrctor', 'FOB') in df.columns:
        # Extract FOB data under 'Contrctor'
        fob_prices = df[('Contrctor', 'FOB')]

        for index, price in fob_prices.items():
            product_data.append({
                'name': sheet_name,  # The size name
                'fob': price,        # The FOB price
            })
    else:
        # Skip this sheet if 'Contrctor' -> 'FOB' is not found
        continue

# Load second Excel file (machine model and size mapping)
df2 = pd.read_excel(file2)
make_brand_model = df2[['make_brand', 'model', 'size']]

# Check if custom fields exist before trying to write
fields = models.execute_kw(db, uid, password, 'ir.model.fields', 'search_read', 
                           [[['model', '=', 'product.template']]], {'fields': ['name']})
available_fields = [field['name'] for field in fields]

# Create or update products in Odoo
for product in product_data:
    # Search for the product by name
    product_id = models.execute_kw(db, uid, password, 'product.template', 'search', [[['name', '=', product['name']]]])
    
    if product_id:
        # Update the existing product with the new price
        models.execute_kw(db, uid, password, 'product.template', 'write', [[product_id[0]], {'list_price': product['fob']}])
    else:
        # Create a new product
        product_id = models.execute_kw(db, uid, password, 'product.template', 'create', [{
            'name': product['name'],
            'list_price': product['fob'],
        }])

# Link products with machine models
for _, row in make_brand_model.iterrows():
    make_brand = row['make_brand']
    model = row['model']
    size = row['size']
    
    # Search for the product by size
    product_id = models.execute_kw(db, uid, password, 'product.template', 'search', [[['name', '=', size]]])
    
    if product_id:
        # Prepare data for fields that exist
        update_data = {}
        if 'make_brand' in available_fields:
            update_data['make_brand'] = make_brand
        if 'model' in available_fields:
            update_data['model'] = model
        
        # Write only if the fields are available
        if update_data:
            models.execute_kw(db, uid, password, 'product.template', 'write', [[product_id[0]], update_data])

print("Import process complete.")