import pymysql

passwords = ['root', 'admin', 'password', '1234', '12345', '123456', 'mysql', '']
found = None

for p in passwords:
    try:
        conn = pymysql.connect(host='127.0.0.1', user='root', password=p)
        print(f"SUCCESS_PASSWORD={p}")
        found = p
        
        # Create DB since we're here
        with conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS rdms_db")
        conn.close()
        break
    except Exception as e:
        pass

if found is None:
    print("ALL_PASSWORDS_FAILED")
