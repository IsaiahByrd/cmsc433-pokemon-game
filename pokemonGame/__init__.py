from flask import Flask
import mariadb

app = Flask(__name__)

DB_CONFIG =  {
    'user': 'root',
    'password': '',
    'host': '127.0.0.1',
    'port': 3306,
    'database': 'pokemon_db'
}

def get_db_connection():
    try:
        connection = mariadb.connect(**DB_CONFIG)
        return connection
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        # In a real app, you might want to handle this more gracefully.
        return None


from pokemonGame import routes, models