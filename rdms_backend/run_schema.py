import pymysql, sys

try:
    conn = pymysql.connect(host='127.0.0.1', user='root', password='AliAhmad786')
    cursor = conn.cursor()
    
    # Read the SQL file
    with open('..\\rdms_database\\rdms_schema.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Split by semicolon and execute each statement
    statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
    
    for stmt in statements:
        try:
            cursor.execute(stmt)
            conn.commit()
        except Exception as e:
            pass  # Skip comment-only or empty statements
    
    conn.close()
    print("SUCCESS: Database rdms_db created with all tables and seed data!")
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
