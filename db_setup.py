import mariadb
import pandas as pd
from pokemonGame import DB_CONFIG

def get_db_connection():
    try:
        connection = mariadb.connect(**DB_CONFIG)
        return connection
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        # In a real app, you might want to handle this more gracefully.
        return None

def initialize_db(excel_file_path):
    db = get_db_connection()
    if not db:
        print("Could not connect to the database. Aborting initialization.")
        return
    
    # get cursor connection if database connection is successful
    cur = db.cursor()
    try:
        # CLEARING THE POKEMON TABLE
        print("Clearing Database")
        cur.execute("TRUNCATE TABLE pokemon")

        # read the excel file with the pokemon data
        df = pd.read_excel(excel_file_path)
        df['Type 2'] = df['Type 2'].where(pd.notna(df['Type 2']), None)  # handle empty

        # set of all the starter pokemon id
        starter_set = {1, 4, 7, 25, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656}
        df['Starter'] = False
        df.loc[df['#'].isin(starter_set), 'Starter'] = True

        # filter to only include rows where Generation is 1, 2, or 3
        df = df[df['Generation'].isin([1, 2, 3])]

        # create a query template that will be used in a loop to insert all pokemon to database
        sql_insert_query = """
            INSERT INTO pokemon(Num, Name, Type1, Type2, Total, HP, Attack, Defense, SpAttack, SpDefense, Speed, Generation, Legendary, Starter)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        # make the list of tuples from the excel data
        excel_data = [tuple(row) for row in df.itertuples(index=False)]

        # Execute the data in the DB
        cur.executemany(sql_insert_query, excel_data)

        # commit the transaction
        db.commit()
    except mariadb.Error as e:
        print(f"Database error during initialization: {e}")
        db.rollback() # Roll back changes in case of error
    except FileNotFoundError:
        print("Error: 'pokemon.xlsx' not found. Please make sure the file is in the same directory.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        # Ensure the connection is always closed
        cur.close()
        db.close()
        print("Database initialization complete. Connection closed.")

if __name__ == '__main__':
    initialize_db('./pokemon_data.xlsx')