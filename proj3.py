# from flask import Flask, render_template, jsonify
# import mariadb
# from flask_sqlalchemy import SQLAlchemy
# from dotenv import load_dotenv
# import pandas as pd
# import os

# from models import db, Pokemon

# DB_CONFIG =  {
#     'user': 'root',
#     'password': '',
#     'host': '127.0.0.1',
#     'port': 3306,
#     'database': 'pokemon_db'
# }

# app = Flask(__name__)

# load_dotenv() #load the .env file

# # Database Config
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pokemon.db' # os.getenv("DATABASE_URL")
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)

# def get_db_connection():
#     try:
#         connection = mariadb.connect(**DB_CONFIG)
#         return connection
#     except mariadb.Error as e:
#         print(f"Error connecting to MariaDB Platform: {e}")
#         # In a real app, you might want to handle this more gracefully.
#         return None


# def initialize_db(excel_file_path):
#     db = get_db_connection()
#     if not db:
#         print("Could not connect to the database. Aborting initialization.")
#         return
    
#     # get cursor connection if database connection is successful
#     cur = db.cursor()
#     try:
#         # CLEARING THE POKEMON TABLE
#         print("Clearing Database")
#         cur.execute("TRUNCATE TABLE pokemon")

#         #read the excel file with the pokemon data
#         df = pd.read_excel(excel_file_path)

#         # create a query template that will be used in a loop to insert all pokemon to database
#         sql_insert_query = """
#             INSERT INTO pokemon(Num, Name, Type1, Type2, Total, HP, Attack, Defense, SpAttack, SpDefense, Speed, Generation, Legendary)
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """

#         # make the list of tuples from the excel data
#         excel_data = [tuple(row) for row in df.itertuples(index=False)]

#         # Execute the data in the DB
#         cur.executemany(sql_insert_query, excel_data)

#         # commit the transaction
#         db.commit()
#     except mariadb.Error as e:
#         print(f"Database error during initialization: {e}")
#         db.rollback() # Roll back changes in case of error
#     except FileNotFoundError:
#         print("Error: 'pokemon.xlsx' not found. Please make sure the file is in the same directory.")
#     except Exception as e:
#         print(f"An unexpected error occurred: {e}")
#     finally:
#         # Ensure the connection is always closed
#         cur.close()
#         db.close()
#         print("Database initialization complete. Connection closed.")




# # def import_data_from_excel(excel_file_path):
# #     if not os.path.exists(excel_file_path):
# #         print(f"Error: Excel file not found at '{excel_file_path}'")
# #         return

# #     try:
# #         df = pd.read_excel(excel_file_path)
# #         print(f"Attempting to import {len(df)} rows from '{excel_file_path}'...")

# #         # Optional: Clear existing data if you want to re-import or prevent duplicates
# #         # with app.app_context(): # Ensure you are in an app context for query operations
# #         Pokemon.query.delete()
# #         db.session.commit()
# #         print("Cleared existing data from Pokemon table.")

# #         for index, row in df.iterrows():
# #             # if 'Name' not in row or '#' not in row or 'Type1' not in row or 'Legendary' not in row:
# #             #     print(f"Skipping row {index}: Missing required columns. Row data: {row.to_dict()}")
# #             #     continue

# #             pokemon = Pokemon(
# #                 Num=row['#'],
# #                 Name=row['Name'],
# #                 Type1=row['Type 1'],
# #                 Type2=row['Type 2'],
# #                 Total=row['Total'],
# #                 HP=row['HP'],
# #                 Attack=row['Attack'],
# #                 Defense=row['Defense'],
# #                 SpAttack=row['Sp. Atk'],
# #                 SpDefense=row['Sp. Def'],
# #                 Speed=row['Speed'],
# #                 Generation=row['Generation'],
# #                 Legendary=row['Legendary']
# #             )
# #             db.session.add(pokemon)

# #         db.session.commit()
# #         print("Data imported successfully!")

# #     except KeyError as e:
# #         print(f"Error: Missing column in Excel file. Please ensure columns exist. Detail: {e}")
# #         db.session.rollback()
# #     except Exception as e:
# #         db.session.rollback()
# #         print(f"An unexpected error occurred during data import: {e}")

# @app.route('/')
# def home():
#     pokemon = Pokemon.query.all()
#     print("pokemon are", pokemon)
#     if pokemon:
#         return render_template('proj3.html', pokemon=pokemon)
    
# @app.route('/api/getAllPokemon', methods=['GET'])
# def get_pokemon():
#     """An API endpoint to fetch all Pokémon data from the DB and return as JSON."""
#     conn = get_db_connection()
#     if not conn:
#         return jsonify({"error": "Database connection failed"}), 500
        
#     cursor = conn.cursor(dictionary=True) # Fetch results as dictionaries
#     cursor.execute("SELECT * FROM pokemon ORDER BY id")
#     pokemon_data = cursor.fetchall()
    
#     cursor.close()
#     conn.close()
    
#     return jsonify(pokemon_data)


# if __name__ == '__main__':
#     initialize_db()
#     app.run(debug=True)


from pokemonGame import app

if __name__ == '__main__':
    app.run(debug=True)