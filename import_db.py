import pandas as pd
import sqlite3

# Load Excel files
excel1_path = r'\\srj-2012-srv\SRJ Business Management System\SRJ Records\Sales & Marketing\Sales Brochures\Machine Make & Model\Machine Make & Model for UC Parts 060220 KM.xlsx'
excel2_path = r'\\srj-2012-srv\SRJ Business Management System\SRJ Records\Sales & Marketing\Sales Brochures\Rubber Tracks\Rubber Track Price & Inventory List\Exc 2024\Rubber Track Price and Inventory 02-09-24.xlsx'

excel1 = pd.ExcelFile(excel1_path)
excel2 = pd.ExcelFile(excel2_path)

# Connect to the SQLite database
conn = sqlite3.connect('search.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
    CREATE TABLE IF NOT EXISTS machines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        make_brand TEXT,
        model TEXT NOT NULL,
        size TEXT NOT NULL
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        size TEXT,
        track_size TEXT,
        mc_make_model TEXT
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS machine_size_link (
        machine_id INTEGER,
        size_id INTEGER,
        FOREIGN KEY (machine_id) REFERENCES machines(id),
        FOREIGN KEY (size_id) REFERENCES sizes(id)
    )
''')

# Open the file to write missing data logs
with open('missing_data_log.txt', 'w') as log_file:

    # Function to insert size if it does not exist and return the size_id
    def insert_if_not_exists_size(size, track_size, mc_make_model):
        cursor.execute('SELECT id FROM sizes WHERE size=? AND track_size=?', (size, track_size))
        row = cursor.fetchone()
        if row is None:  # If no entry exists, insert new data
            cursor.execute('INSERT INTO sizes (size, track_size, mc_make_model) VALUES (?, ?, ?)', 
                           (size, track_size, mc_make_model))
            return cursor.lastrowid
        else:
            return row[0]  # Return existing size_id

    # Function to insert machine and return machine_id
    def insert_machine(make_brand, model, size):
        cursor.execute('INSERT INTO machines (make_brand, model, size) VALUES (?, ?, ?)', 
                       (make_brand, model, size))
        return cursor.lastrowid

    # Collect all sizes first to avoid looping repeatedly
    size_dict = {}
    for sheet_name in excel2.sheet_names:
        df = excel2.parse(sheet_name)
        if 'Track Size' in df.columns and 'MC Make & Model' in df.columns:
            for _, row in df[['Track Size', 'MC Make & Model']].iterrows():
                size_key = (sheet_name, row['Track Size'])  # Create a unique key based on sheet_name and track_size
                if size_key not in size_dict:
                    cursor.execute('INSERT INTO sizes (size, track_size, mc_make_model) VALUES (?, ?, ?)', 
                                   (sheet_name, row['Track Size'], row['MC Make & Model']))
                    size_dict[size_key] = cursor.lastrowid  # Store size_id in a dictionary for quick access

    # Now insert machines and link to sizes
    for sheet_name in excel1.sheet_names:
        df = excel1.parse(sheet_name)
        
        # Check if both 'model' and 'size' columns are present
        if 'model' in df.columns and 'size' in df.columns:
            for _, row in df[['model', 'size']].iterrows():
                # Skip rows with NULL or missing values in 'model' or 'size'
                if pd.notnull(row['model']) and pd.notnull(row['size']):
                    machine_id = insert_machine(sheet_name, row['model'], row['size'])  # Insert machine
                    
                    # Link machine to size by checking if the size exists in the size_dict
                    size_key = (sheet_name, row['size'])
                    if size_key in size_dict:
                        size_id = size_dict[size_key]
                        cursor.execute('INSERT INTO machine_size_link (machine_id, size_id) VALUES (?, ?)', 
                                       (machine_id, size_id))
                else:
                    log_file.write(f"Skipping row with missing data in sheet {sheet_name}: {row}\n")  # Write to log

# Commit changes and close connection
conn.commit()
conn.close()