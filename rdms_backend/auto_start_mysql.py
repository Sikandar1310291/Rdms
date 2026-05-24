import socket
import time
import subprocess
import pymysql

def wait_for_mysql():
    print("⏳ Waiting for XAMPP MySQL to start on port 3306...")
    while True:
        try:
            with socket.create_connection(('127.0.0.1', 3306), timeout=1):
                print("✅ MySQL is running!")
                return
        except OSError:
            time.sleep(2)

def create_db():
    print("🛠️ Creating/verifying database 'rdms_db'...")
    try:
        conn = pymysql.connect(host='127.0.0.1', user='root', password='')
        with conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS rdms_db")
        conn.close()
        print("✅ Database created.")
    except Exception as e:
        print(f"Error creating DB: {e}")

if __name__ == "__main__":
    wait_for_mysql()
    create_db()
    
    print("📦 Running migrations...")
    subprocess.run([".\\venv\\Scripts\\python.exe", "manage.py", "makemigrations"])
    subprocess.run([".\\venv\\Scripts\\python.exe", "manage.py", "migrate"])
    
    print("🌱 Seeding data...")
    subprocess.run([".\\venv\\Scripts\\python.exe", "manage.py", "seed_data"])
    
    print("🚀 Starting Django server on port 8000...")
    subprocess.run([".\\venv\\Scripts\\python.exe", "manage.py", "runserver"])
