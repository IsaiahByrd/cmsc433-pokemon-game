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

class UserPokemon:
    """Model for tracking which Pokemon a user has collected."""
    
    @staticmethod
    def add_pokemon_to_collection(user_id, pokemon_id):
        """Add a Pokemon to user's collection."""
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        try:
            # Insert or ignore if already exists
            cursor.execute(
                "INSERT IGNORE INTO user_pokemon (user_id, pokemon_id, collected_at) VALUES (?, ?, NOW())",
                (user_id, pokemon_id)
            )
            conn.commit()
            return True
        except mariadb.Error as e:
            print(f"Error adding Pokemon to collection: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_user_collection(user_id):
        """Get all Pokemon IDs that a user has collected."""
        conn = get_db_connection()
        if not conn:
            return []
        
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT pokemon_id FROM user_pokemon WHERE user_id = ?", (user_id,))
            collected_ids = [row[0] for row in cursor.fetchall()]
            return collected_ids
        except mariadb.Error as e:
            print(f"Error getting user collection: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_user_team(user_id):
        """Get all Pokemon IDs that a user has in their team (slot is not NULL)."""
        conn = get_db_connection()
        if not conn:
            return []
        
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT pokemon_id FROM user_pokemon WHERE user_id = ? AND slot IS NOT NULL ORDER BY slot", (user_id,))
            team_ids = [row[0] for row in cursor.fetchall()]
            return team_ids
        except mariadb.Error as e:
            print(f"Error getting user team: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def remove_pokemon_from_collection(user_id, pokemon_id):
        """Remove a Pokemon from user's collection."""
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        try:
            cursor.execute(
                "DELETE FROM user_pokemon WHERE user_id = ? AND pokemon_id = ?",
                (user_id, pokemon_id)
            )
            conn.commit()
            return True
        except mariadb.Error as e:
            print(f"Error removing Pokemon from collection: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()
            conn.close()
    
    # In UserPokemon or a new UserTeam class
    @staticmethod
    def save_team(user_id, team_ids):
        """
        Update the user's team slots in user_pokemon.
        Only updates the slot column for the given user_id and pokemon_ids.
        If a pokemon_id is not in the user's collection, it will not be updated.
        """
        conn = get_db_connection()
        if not conn:
            return False, "DB error"
        cursor = conn.cursor()
        try:
            # Reset all slots to NULL for this user
            cursor.execute(
                "UPDATE user_pokemon SET slot = NULL WHERE user_id = ?", (user_id,)
            )
            # Update slot for each pokemon in the new team
            for slot, pid in enumerate(team_ids, 1):
                cursor.execute(
                    "UPDATE user_pokemon SET slot = ? WHERE user_id = ? AND pokemon_id = ?",
                    (slot, user_id, pid)
                )
            conn.commit()
            return True, "Team saved"
        except Exception as e:
            conn.rollback()
            return False, str(e)
        finally:
            cursor.close()
            conn.close()

class Pokemon:
    """Model for Pokemon data."""
    
    @staticmethod
    def get_all_pokemon():
        """Get all Pokemon from the database (first 3 generations only)."""
        conn = get_db_connection()
        if not conn:
            return []
        
        cursor = conn.cursor(dictionary=True)
        try:
            # Only get Pokemon from first 3 generations (Gen 1-3, Num 1-386)
            cursor.execute("SELECT * FROM pokemon WHERE Generation <= 3 ORDER BY Num")
            pokemon_data = cursor.fetchall()
            return pokemon_data
        except mariadb.Error as e:
            print(f"Error getting Pokemon data: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all__starters():
        conn = get_db_connection()
        if not conn:
            return []
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM pokemon WHERE starter=1 GROUP BY Generation ORDER BY Num ")
            starter_data = cursor.fetchall()
            return starter_data
        except mariadb.Error as e:
            print(f"Error getting Pokemon data: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_pokemon_by_id(pokemon_id):
        """Get a specific Pokemon by ID."""
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM pokemon WHERE id = ?", (pokemon_id,))
            pokemon_data = cursor.fetchone()
            return pokemon_data
        except mariadb.Error as e:
            print(f"Error getting Pokemon by ID: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def clean_pokemon_name(name):
        """Clean malformed Pokemon names, especially Mega Pokemon names."""
        if not name:
            return name
            
        original_name = name.strip()
        
        # Fix malformed Mega Pokemon names like "CharizardMega Charizard Y"
        if 'Mega' in original_name and not original_name.startswith('Mega'):
            # Split on 'Mega' to separate the parts
            parts = original_name.split('Mega', 1)
            if len(parts) == 2:
                base_name = parts[0].strip()
                mega_suffix = parts[1].strip()
                
                # Common patterns to handle:
                # "CharizardMega Charizard Y" -> "Mega Charizard Y"
                # "BlastoiseMega Blastoise" -> "Mega Blastoise"
                
                # If the suffix already contains the base name, use it
                if base_name.lower() in mega_suffix.lower():
                    return f"Mega {mega_suffix}"
                else:
                    # If suffix is just a form indicator (X, Y, etc.), combine properly
                    if mega_suffix.strip() in ['X', 'Y', 'Z']:
                        return f"Mega {base_name} {mega_suffix}"
                    else:
                        return f"Mega {base_name} {mega_suffix}".strip()
        
        return original_name
