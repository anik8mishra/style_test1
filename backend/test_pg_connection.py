import psycopg2

try:
    conn = psycopg2.connect(
        dbname="postgres",  # test DB
        user="postgres",
        password="stylesync123",  # replace with the password you set in pgAdmin
        host="localhost",
        port="5432"
    )
    print("✅ Connected successfully!")
except Exception as e:
    print("❌ Failed to connect:", e)
