from flask import render_template, jsonify, request, flash, redirect, url_for
from pokemonGame import app, get_db_connection
from pokemonGame.models import User

from werkzeug.security import generate_password_hash, check_password_hash

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

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            # Login successful, redirect to menu or dashboard
            return redirect(url_for('menu'))
        else:
            flash("Invalid username or password", "danger")
            return render_template('auth/login.html', username=username)

    return render_template('auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        confirmPassword = request.form["confirmPassword"]

        if password != confirmPassword:
            flash("Passwords do not match", "danger")
            return render_template('auth/register.html', username=username)

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
        existing_user = cursor.fetchone()

        if existing_user:
            flash("Username already exists", "danger")
            cursor.close()
            conn.close()
            return render_template('auth/register.html', username=username)

        password_hash = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
        conn.commit()
        cursor.close()
        conn.close()
        flash("Registration successful! Please log in.", "success")
        return redirect(url_for('login'))

    return render_template('auth/register.html')

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
