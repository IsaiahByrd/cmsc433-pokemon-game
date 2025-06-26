from flask import render_template, jsonify, request, flash, redirect, url_for
from pokemonGame import app, get_db_connection
from pokemonGame.models import User

@app.route('/')
def index():
    return render_template('proj3.html')

@app.route('/')
def home():
    # Don't pass pokemon data to template to avoid displaying all names
    return render_template('proj3.html')

@app.route('/menu')
def menu():
    return render_template('menu/menu.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # db = get_db()

        # database logic for jason ("SELECT * FROM user WHERE username = ?"), (username,))

    return render_template('/auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        confirmPassword = request.form["confirmPassword"]
        # db = get_db()
    
        if password != confirmPassword:
            # let user know passwords don't match
            return render_template('/auth/register.html', username=username)
        
        # db logic goes here
    return render_template('/auth/register.html')

@app.route('/battle')
def battle():
    return render_template('menu/battle/battle.html')

@app.route('/teambuilder')
def teambuilder():
    return render_template('menu/teambuilder/teambuilder.html')

@app.route('/viewcollection')
def viewcollection():
    return render_template('menu/viewcollection/viewcollection.html')

@app.route('/api/pokemon', methods=['GET'])
def get_pokemon_api():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM pokemon ORDER BY id")
    pokemon_data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(pokemon_data)
