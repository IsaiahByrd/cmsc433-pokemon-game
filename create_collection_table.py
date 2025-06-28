import mariadb
from pokemonGame import DB_CONFIG

def create_user_pokemon_table():
    """Create the user_pokemon table for tracking collections."""
    conn = mariadb.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Create user_pokemon table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_pokemon (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                pokemon_id INT NOT NULL,
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_pokemon (user_id, pokemon_id)
            )
        """)
        
        conn.commit()
        print("User Pokemon collection table created successfully!")
        
    except mariadb.Error as e:
        print(f"Error creating user_pokemon table: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_user_pokemon_table()
