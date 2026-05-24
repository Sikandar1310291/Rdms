import sqlite3

def show_donors():
    print("=" * 60)
    print("Fetching Donors Directly from the RDMS Database...")
    print("=" * 60)
    
    # Connect to the SQLite database
    conn = sqlite3.connect('db.sqlite3')
    
    # Query the donors table
    query = "SELECT id, name, email, donor_type, phone FROM donors_donor"
    
    try:
        cur = conn.cursor()
        cur.execute(query)
        rows = cur.fetchall()
        
        if not rows:
            print("No donors found in the database. Go add one from the frontend!")
        else:
            print(f"{'ID':<5} | {'NAME':<20} | {'TYPE':<15} | {'EMAIL':<25} | {'PHONE'}")
            print("-" * 80)
            for row in rows:
                print(f"{row[0]:<5} | {str(row[1]):<20} | {str(row[3]):<15} | {str(row[2]):<25} | {str(row[4])}")
    except Exception as e:
        print(f"Error reading database: {e}")
    finally:
        conn.close()
        
    print("\n" + "=" * 60)

if __name__ == "__main__":
    show_donors()
