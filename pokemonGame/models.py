from werkzeug.security import generate_password_hash, check_password_hash
import mariadb
from pokemonGame import get_db_connection

class User:
    def __init__(self, username, email=None, user_id=None):
        self.id = user_id
        self.username = username
        self.email = email
        self.password_hash = None

    def set_password(self, password):
        """Creates a secure hash of the password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the hash."""
        return check_password_hash(self.password_hash, password)
    
    def save_to_db(self):
        """Save user to database."""
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        try:
            # Insert user into database
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (self.username, self.email, self.password_hash)
            )
            conn.commit()
            # Get the ID of the newly inserted user
            self.id = cursor.lastrowid
            return True
        except mariadb.Error as e:
            print(f"Error saving user to database: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def find_by_username(username):
        """Find user by username."""
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
            user_data = cursor.fetchone()
            
            if user_data:
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    user_id=user_data['id']
                )
                user.password_hash = user_data['password_hash']
                return user
            return None
        except mariadb.Error as e:
            print(f"Error finding user: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def username_exists(username):
        """Check if username already exists."""
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = ?", (username,))
            count = cursor.fetchone()[0]
            return count > 0
        except mariadb.Error as e:
            print(f"Error checking username existence: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
