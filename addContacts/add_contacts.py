import sqlite3

conn = sqlite3.connect("contacts.db")
cursor = conn.cursor()

# Function to add contact
def add_contact(name, phone):
    try:
        cursor.execute("INSERT INTO contacts (name, phone) VALUES (?, ?)", (name.lower(), phone))
        conn.commit()
        print(f"Contact {name} added.")
    except sqlite3.IntegrityError:
        print(f"Contact {name} already exists.")

def delete_contact(name):
    cursor.execute("DELETE FROM contacts WHERE LOWER(name) = ?", (name,))
    conn.commit()
    if cursor.rowcount > 0:
        print(f"Contact {name} deleted.")
    else:
        print(f"Contact {name} not found.")

add_contact("sahil pandit",'+919350604072')
conn.close()

