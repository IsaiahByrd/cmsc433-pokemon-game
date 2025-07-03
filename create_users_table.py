import mariadb
from pokemonGame import DB_CONFIG

def create_users_table():
    """Create the users table if it doesn't exist."""
    conn = mariadb.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100),
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL
            )
        """)
        
        conn.commit()
        print("Users table created successfully!")
        
    except mariadb.Error as e:
        print(f"Error creating users table: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_users_table()
