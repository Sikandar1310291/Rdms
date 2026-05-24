"""
RDMS MySQL Migration Script
===========================
Run this AFTER confirming MySQL password works in Workbench.
This script:
  1. Exports all data from SQLite (db.sqlite3)
  2. Reconfigures Django to use MySQL
  3. Creates the rdms_db database in MySQL
  4. Runs all migrations on MySQL
  5. Imports all your data into MySQL

Usage:
    python migrate_to_mysql.py --password YOUR_PASSWORD
"""
import subprocess
import sys
import os
import json
import pymysql

def run(cmd, cwd=None, check=True):
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr and check:
        print("[STDERR]", result.stderr[:500])
    if check and result.returncode != 0:
        print(f"[ERROR] Command failed with exit code {result.returncode}")
        sys.exit(1)
    return result

def main():
    # ── Get password ──────────────────────────────────────────────────
    if len(sys.argv) < 3 or sys.argv[1] != '--password':
        print("Usage: python migrate_to_mysql.py --password YOUR_MYSQL_PASSWORD")
        sys.exit(1)

    password = sys.argv[2]
    BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
    PYTHON = os.path.join(BACKEND_DIR, 'venv', 'Scripts', 'python.exe')

    print("=" * 60)
    print("   RDMS -> MySQL Migration (Senior Engineer Edition)")
    print("=" * 60)

    # ── Step 1: Test MySQL connection ─────────────────────────────────
    print("\n[1/5] Testing MySQL connection...")
    try:
        conn = pymysql.connect(
            host='127.0.0.1',
            user='root',
            password=password,
            port=3306,
            connect_timeout=5
        )
        print("     ✅ MySQL connection SUCCESSFUL!")
        conn.close()
    except Exception as e:
        print(f"     ❌ Connection FAILED: {e}")
        print("\nPlease verify your password in MySQL Workbench first.")
        sys.exit(1)

    # ── Step 2: Create database ───────────────────────────────────────
    print("\n[2/5] Creating 'rdms_db' database in MySQL...")
    try:
        conn = pymysql.connect(host='127.0.0.1', user='root', password=password, port=3306)
        with conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS rdms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            cursor.execute("SHOW DATABASES LIKE 'rdms_db'")
            result = cursor.fetchone()
            if result:
                print(f"     ✅ Database 'rdms_db' is ready!")
        conn.close()
    except Exception as e:
        print(f"     ❌ Failed to create database: {e}")
        sys.exit(1)

    # ── Step 3: Export data from SQLite ───────────────────────────────
    print("\n[3/5] Exporting current SQLite data...")
    sqlite_dump = os.path.join(BACKEND_DIR, 'sqlite_data_backup.json')
    result = run(
        f'"{PYTHON}" manage.py dumpdata --natural-foreign --natural-primary '
        f'--exclude auth.permission --exclude contenttypes -o "{sqlite_dump}"',
        cwd=BACKEND_DIR, check=False
    )
    if os.path.exists(sqlite_dump):
        with open(sqlite_dump) as f:
            data = json.load(f)
        print(f"     ✅ Exported {len(data)} records to sqlite_data_backup.json")
    else:
        print("     ⚠️  No SQLite data exported (database might be empty - continuing)")

    # ── Step 4: Set DB env vars and run migrations on MySQL ───────────
    print("\n[4/5] Running Django migrations on MySQL...")
    env = os.environ.copy()
    env['DB_HOST'] = '127.0.0.1'
    env['DB_USER'] = 'root'
    env['DB_PASSWORD'] = password
    env['DB_NAME'] = 'rdms_db'
    env['DB_PORT'] = '3306'

    result = subprocess.run(
        f'"{PYTHON}" manage.py migrate',
        shell=True, cwd=BACKEND_DIR,
        capture_output=True, text=True, env=env
    )
    print(result.stdout)
    if result.returncode != 0:
        print("[ERROR]", result.stderr[:500])
        sys.exit(1)
    print("     ✅ All migrations applied to MySQL!")

    # ── Step 5: Import data into MySQL ────────────────────────────────
    if os.path.exists(sqlite_dump):
        print("\n[5/5] Importing data into MySQL...")
        result = subprocess.run(
            f'"{PYTHON}" manage.py loaddata "{sqlite_dump}"',
            shell=True, cwd=BACKEND_DIR,
            capture_output=True, text=True, env=env
        )
        print(result.stdout)
        if result.returncode != 0:
            print("[WARN] Some records may have failed to import:", result.stderr[:300])
        else:
            print("     ✅ All data imported into MySQL!")

    # ── Step 6: Update settings.py ────────────────────────────────────
    print("\n[6/6] Updating settings.py with MySQL credentials...")
    settings_path = os.path.join(BACKEND_DIR, 'rdms_core', 'settings.py')
    with open(settings_path, 'r') as f:
        content = f.read()

    old_password_line = "password=os.environ.get('DB_PASSWORD', 'AliAhmad786'),"
    new_password_line = f"password=os.environ.get('DB_PASSWORD', '{password}'),"
    content = content.replace(old_password_line, new_password_line)

    old_pass2 = "'PASSWORD': os.environ.get('DB_PASSWORD', 'AliAhmad786'),"
    new_pass2 = f"'PASSWORD': os.environ.get('DB_PASSWORD', '{password}'),"
    content = content.replace(old_pass2, new_pass2)

    with open(settings_path, 'w') as f:
        f.write(content)
    print(f"     ✅ settings.py updated with password!")

    print("\n" + "=" * 60)
    print("   🎉 MIGRATION COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Restart Django server: python manage.py runserver 8000")
    print("  2. Open MySQL Workbench → rdms_db → See all tables with data!")
    print("  3. Add a donor from frontend → Refresh Workbench → It appears live!")
    print()

if __name__ == '__main__':
    main()
