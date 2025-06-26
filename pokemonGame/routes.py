from flask import render_template, jsonify, request, flash, redirect, url_for
from pokemonGame import app, get_db_connection
from pokemonGame.models import User

@app.route('/')
def index():
    return render_template('proj3.html')

# @app.route('/register', methods=['GET', 'POST'])
# def register():
#     if request.method == 'POST':
#         # PSEUDOCODE for handling registration
#         # 1. Get username, email, and password from request.form
#         # 2. Check if username or email already exist in the 'user' table.
#         # 3. If they don't exist:
#         #    a. Create a User object from models.py
#         #    b. Set the password using user.set_password(password)
#         #    c. INSERT the new user's data into the 'user' table.
#         #    d. Commit the database transaction.
#         #    e. flash('Registration successful! Please log in.')
#         #    f. return redirect(url_for('login'))
#         # 4. If they exist, flash an error message.
#         pass # Replace this with actual logic
#     return render_template('register.html', title='Register')

# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         # PSEUDOCODE for handling login
#         # 1. Get username and password from request.form
#         # 2. SELECT user data from the 'user' table where username matches.
#         # 3. If a user is found:
#         #    a. Create a User object.
#         #    b. Load the stored password_hash into the user object.
#         #    c. If user.check_password(password_from_form) is True:
#         #       i. Store user's ID in the session (flask.session['user_id'] = user.id)
#         #       ii. return redirect(url_for('capture'))
#         #    d. Else, flash('Invalid password')
#         # 4. If no user is found, flash('Invalid username')
#         pass # Replace this with actual logic
#     return render_template('login.html', title='Sign In')


# @app.route('/battle')
# def battle():
#     # PSEUDOCODE for battle screen
#     # 1. Connect to the DB.
#     # 2. SELECT two random pokemon from the 'pokemon' table.
#     # 3. Pass the data for these two pokémon to the template.
#     # 4. Close the DB connection.
#     return render_template('battle.html', title='Battle!')


# @app.route('/capture')
# def capture():
#     # This requires the user to be logged in. Add a check for that.
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     cursor.execute("SELECT id, name, type1 FROM pokemon ORDER BY id")
#     all_pokemon = cursor.fetchall()
#     cursor.close()
#     conn.close()
    
#     return render_template('capture.html', title='Capture Pokémon', pokemon_list=all_pokemon)


@app.route('/api/pokemon', methods=['GET'])
def get_pokemon_api():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM pokemon ORDER BY id")
    pokemon_data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(pokemon_data)
