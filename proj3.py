from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import pandas as pd
import os

from models import db, Pokemon

app = Flask(__name__)

load_dotenv() #load the .env file

# Database Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pokemon.db' # os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def import_data_from_excel(excel_file_path):
    if not os.path.exists(excel_file_path):
        print(f"Error: Excel file not found at '{excel_file_path}'")
        return

    try:
        df = pd.read_excel(excel_file_path)
        print(f"Attempting to import {len(df)} rows from '{excel_file_path}'...")

        # Optional: Clear existing data if you want to re-import or prevent duplicates
        # with app.app_context(): # Ensure you are in an app context for query operations
        Pokemon.query.delete()
        db.session.commit()
        print("Cleared existing data from Pokemon table.")

        for index, row in df.iterrows():
            # if 'Name' not in row or '#' not in row or 'Type1' not in row or 'Legendary' not in row:
            #     print(f"Skipping row {index}: Missing required columns. Row data: {row.to_dict()}")
            #     continue

            pokemon = Pokemon(
                Num=row['#'],
                Name=row['Name'],
                Type1=row['Type 1'],
                Type2=row['Type 2'],
                Total=row['Total'],
                HP=row['HP'],
                Attack=row['Attack'],
                Defense=row['Defense'],
                SpAttack=row['Sp. Atk'],
                SpDefense=row['Sp. Def'],
                Speed=row['Speed'],
                Generation=row['Generation'],
                Legendary=row['Legendary']
            )
            db.session.add(pokemon)

        db.session.commit()
        print("Data imported successfully!")

    except KeyError as e:
        print(f"Error: Missing column in Excel file. Please ensure columns exist. Detail: {e}")
        db.session.rollback()
    except Exception as e:
        db.session.rollback()
        print(f"An unexpected error occurred during data import: {e}")

@app.route('/')
def home():
    # Don't pass pokemon data to template to avoid displaying all names
    return render_template('proj3.html')

@app.route('/menu')
def menu():
    return render_template('menu/menu.html')

@app.route('/battle')
def battle():
    return render_template('menu/battle/battle.html')

@app.route('/teambuilder')
def teambuilder():
    return render_template('menu/teambuilder/teambuilder.html')

@app.route('/viewcollection')
def viewcollection():
    return render_template('menu/viewcollection/viewcollection.html')

if __name__ == '__main__':
    with app.app_context():
        # db_path = 'instance/pokemon.db'
        # if os.path.exists(db_path):
        #     os.remove(db_path)
        #     print(f"Removed existing database file: {db_path}")
        db.create_all()
        excel_file_name = 'pokemon_data.xlsx'
        import_data_from_excel(excel_file_name)
    app.run(debug=True)
