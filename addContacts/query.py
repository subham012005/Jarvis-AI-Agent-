import sqlite3

def get_contact_phone(name):
    conn = sqlite3.connect("contacts.db")
    cursor = conn.cursor()
    cursor.execute("SELECT phone FROM contacts WHERE name = ?", (name,))
    result = cursor.fetchone()
    conn.close()
    if result:
        return result[0]
    else:
        return None

# Example usage:
name = input("Enter contact name: ")
phone = get_contact_phone(name)
if phone:
    print(f"Phone number for {name}: {phone}")
else:
    print(f"Contact {name} not found.")
