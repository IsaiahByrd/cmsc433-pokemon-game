from flask import render_template, jsonify, request, flash, redirect, url_for, session
from pokemonGame import app, get_db_connection
from pokemonGame.models import User, UserPokemon, Pokemon
import secrets
import string
import random

def generate_random_username():
    """Generate a random username with prefix 'Trainer' and random suffix."""
    random_suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
    return f"Trainer{random_suffix}"

def generate_random_password():
    """Generate a secure random password."""
    # Use a mix of letters, digits, and special characters
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(characters) for _ in range(12))
    return password

from werkzeug.security import generate_password_hash, check_password_hash

@app.route('/')
def home():
    # Don't pass pokemon data to template to avoid displaying all names
    return render_template('proj3.html')

@app.route('/menu')
def menu():
    return render_template('menu/menu.php')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        
        # Find user in database
        user = User.find_by_username(username)
        
        if user and user.check_password(password):
            # Login successful
            session['user_id'] = user.id
            session['username'] = user.username

             # Check if user has any collected Pokémon
            if not UserPokemon.get_user_collection(user.id):
                return redirect(url_for('choose_starter'))
            

            flash(f"Welcome back, {username}!", "success")
            return redirect(url_for('menu'))
        else:
            # Login failed
            flash("Invalid username or password. Please try again.", "error")
            return render_template('/auth/login.html', username=username)


    return render_template('auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        # Check if user wants to use custom credentials or generate random ones
        use_random = request.form.get("use_random", False)
        
        if use_random:
            # Generate random username and password
            username = generate_random_username()
            password = generate_random_password()
            confirmPassword = password  # No need to confirm for auto-generated
        else:
            # Use provided credentials
            username = request.form["username"].strip()
            password = request.form["password"]
            confirmPassword = request.form["confirmPassword"]
        
        # Validate inputs
        if not username:
            flash("Username is required.", "error")
            return render_template('/auth/register.html')
            
        if len(username) < 3:
            flash("Username must be at least 3 characters long.", "error")
            return render_template('/auth/register.html', username=username)
        
        if password != confirmPassword:
            flash("Passwords don't match. Please try again.", "error")
            return render_template('/auth/register.html', username=username)
            
        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "error")
            return render_template('/auth/register.html', username=username)
        
        # Check if username already exists
        if User.username_exists(username):
            if use_random:
                # If random generation failed due to collision, try again
                return register()  # Recursive call to try again
            else:
                flash("Username already exists. Please choose a different one.", "error")
                return render_template('/auth/register.html', username=username)
        
        # Create new user
        user = User(username=username)
        user.set_password(password)
        
        # Save to database
        if user.save_to_db():
            # Registration successful
            session['user_id'] = user.id
            session['username'] = user.username
            
            if use_random:
                flash(f"Account created! Your username is '{username}' and your password is '{password}'. Please save these credentials!", "info")
            else:
                flash(f"Registration successful! Welcome, {username}!", "success")

            if not UserPokemon.get_user_collection(user.id):
                return redirect(url_for('choose_starter'))
            
            return redirect(url_for('menu'))
        else:
            flash("Registration failed. Please try again.", "error")
            return render_template('/auth/register.html', username=username)
    
    return render_template('/auth/register.html')


@app.route('/logout')
def logout():
    """Log out the current user."""
    username = session.get('username', 'User')
    session.clear()
    flash(f"Goodbye, {username}! You have been logged out.", "info")
    return redirect(url_for('home'))

@app.route('/battle')
def battle():
    if 'user_id' not in session:
        flash("Please log in to access the battle arena.", "warning")
        return redirect(url_for('login'))

    user_id = session['user_id']
    team_ids = UserPokemon.get_user_team(user_id)
    all_pokemon = Pokemon.get_all_pokemon()
    user_team = [p for p in all_pokemon if p['id'] in team_ids]

    if not user_team:
        flash("Please build a team before battling.", "warning")
        return redirect(url_for('teambuilder'))

    return render_template('menu/battle/battle.html', team=user_team)


@app.route('/collectpokemon')
def collectpokemon():
    # Check if user is logged in
    if 'user_id' not in session:
        flash("Please log in to access the battle arena.", "warning")
        return redirect(url_for('login'))
    return render_template('menu/teambuilder/collectpokemon.html')

@app.route('/teambuilder')
def teambuilder():
    if 'user_id' not in session:
        flash("Please log in to access the team builder.", "warning")
        return redirect(url_for('login'))
    user_id = session['user_id']
    captured_ids = UserPokemon.get_user_collection(user_id)
    captured_pokemon = [p for p in Pokemon.get_all_pokemon() if p['id'] in captured_ids]
    team_ids = UserPokemon.get_user_team(user_id)
    all_pokemon = Pokemon.get_all_pokemon()
    user_team = [p for p in all_pokemon if p['id'] in team_ids]
    return render_template('menu/teambuilder/teambuilder.html', captured_pokemon=captured_pokemon, user_team=user_team)

@app.route('/save_team', methods=['POST'])
def save_team():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    user_id = session['user_id']
    team_ids = request.json.get('team', [])
    if not (1 <= len(team_ids) <= 6):
        return jsonify({'success': False, 'message': 'Team must have 1-6 Pokémon.'}), 400
    # Save team to DB (replace with your own logic)
    success, message = UserPokemon.save_team(user_id, team_ids)
    return jsonify({'success': success, 'message': message})


@app.route('/api/user_team')
def get_user_team_api():
    if 'user_id' not in session:
        return jsonify([])
    user_id = session['user_id']
    team_ids = UserPokemon.get_user_team(user_id)
    all_pokemon = Pokemon.get_all_pokemon()
    user_team = [p for p in all_pokemon if p['id'] in team_ids]
    return jsonify(user_team)


@app.route('/viewcollection')
def viewcollection():
    # Check if user is logged in
    if 'user_id' not in session:
        flash("Please log in to view your collection.", "warning")
        return redirect(url_for('login'))
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = 50  # 50 Pokemon per page
    filter_type = request.args.get('filter', 'all')
    
    # Get all Pokemon from database
    all_pokemon = Pokemon.get_all_pokemon()
    
    # Get user's collected Pokemon
    user_id = session['user_id']
    collected_pokemon_ids = UserPokemon.get_user_collection(user_id)
    
    # Add collection status to each Pokemon
    for pokemon in all_pokemon:
        pokemon['collected'] = pokemon['id'] in collected_pokemon_ids
        
        # Fix malformed Pokemon names using the centralized method
        pokemon['Name'] = Pokemon.clean_pokemon_name(pokemon['Name'])
        
        # Use pixelated sprites for retro aesthetic and better performance
        pokemon['sprite_url'] = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon['Num']}.png"
        # Fallback to front_default sprite if numbered sprite doesn't exist
        pokemon['fallback_sprite'] = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/front_default/{pokemon['Num']}.png"
    
    # Apply filter
    filtered_pokemon = []
    if filter_type == 'collected':
        filtered_pokemon = [p for p in all_pokemon if p['collected']]
    elif filter_type == 'uncollected':
        filtered_pokemon = [p for p in all_pokemon if not p['collected']]
    elif filter_type == 'legendary':
        filtered_pokemon = [p for p in all_pokemon if p['Legendary']]
    else:  # 'all'
        filtered_pokemon = all_pokemon
    
    # Calculate pagination
    total_filtered = len(filtered_pokemon)
    total_pages = (total_filtered + per_page - 1) // per_page  # Ceiling division
    
    # Ensure page is within bounds
    page = max(1, min(page, total_pages if total_pages > 0 else 1))
    
    # Get Pokemon for current page
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    pokemon_page = filtered_pokemon[start_idx:end_idx]
    
    # Calculate collection statistics (for all Pokemon, not just filtered)
    total_pokemon = len(all_pokemon)
    collected_count = len(collected_pokemon_ids)
    collection_percentage = (collected_count / total_pokemon * 100) if total_pokemon > 0 else 0
    
    return render_template('menu/viewcollection/viewcollection.html', 
                         pokemon_list=pokemon_page,
                         total_pokemon=total_pokemon,
                         collected_count=collected_count,
                         collection_percentage=collection_percentage,
                         current_page=page,
                         total_pages=total_pages,
                         has_prev=page > 1,
                         has_next=page < total_pages,
                         filter_type=filter_type,
                         total_filtered=total_filtered)

@app.route('/toggle_pokemon/<int:pokemon_id>', methods=['POST'])
def toggle_pokemon(pokemon_id):
    """Toggle a Pokemon in the user's collection."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    user_id = session['user_id']
    collected_pokemon_ids = UserPokemon.get_user_collection(user_id)
    
    if pokemon_id in collected_pokemon_ids:
        # Remove from collection
        success = UserPokemon.remove_pokemon_from_collection(user_id, pokemon_id)
        action = 'removed'
    else:
        # Add to collection
        success = UserPokemon.add_pokemon_to_collection(user_id, pokemon_id)
        action = 'added'
    
    if success:
        return jsonify({'success': True, 'action': action})
    else:
        return jsonify({'error': 'Database operation failed'}), 500

@app.route('/api/pokemon', methods=['GET'])
def get_pokemon_api():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Only get Pokemon from first 3 generations (Gen 1-3, Num 1-386)
    cursor.execute("SELECT * FROM pokemon WHERE Generation <= 3 ORDER BY id")
    pokemon_data = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Clean Pokemon names before returning
    for pokemon in pokemon_data:
        if 'Name' in pokemon:
            pokemon['Name'] = Pokemon.clean_pokemon_name(pokemon['Name'])
    
    return jsonify(pokemon_data)

@app.route('/choose_starter', methods=['GET', 'POST'])
def choose_starter():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        pokemon_id = int(request.form['pokemon_id'])
        UserPokemon.add_pokemon_to_collection(session['user_id'], pokemon_id)
        flash("Starter Pokémon chosen! Good luck!", "success")
        return redirect(url_for('menu'))

    # Show all starter Pokémon (you can filter by generation/types if you want)
    all_pokemon = Pokemon.get_all_pokemon()
    return render_template('choose_starter.html', pokemon_list=all_pokemon)
#catch route
@app.route('/catch/<int:pokemon_id>', methods=['POST'])
def catch_pokemon(pokemon_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    success = UserPokemon.add_pokemon_to_collection(user_id, pokemon_id)

    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Database operation failed'}), 500
    

@app.route('/get_opponent')
def get_opponent():
    import random
    all_pokemon = Pokemon.get_all_pokemon()
    opponent = random.choice(all_pokemon)

    return jsonify({
        'id': opponent['id'],
        'name': opponent['Name'],
        'hp': opponent['HP'],
        'attack': opponent['Attack'],
        'sprite': f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{opponent['Num']}.png"
    })


@app.route('/api/random_pokemon')
def random_pokemon():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Find min and max ID range
        cursor.execute("SELECT MIN(id) AS min_id, MAX(id) AS max_id FROM pokemon")
        result = cursor.fetchone()
        min_id = result['min_id']
        max_id = result['max_id']

        # Pick a random ID and fetch it (loop in case of gaps)
        while True:
            random_id = random.randint(min_id, max_id)
            cursor.execute("SELECT * FROM pokemon WHERE id = %s", (random_id,))
            pokemon = cursor.fetchone()
            if pokemon:
                # Optional: clean name and add sprite
                pokemon['Name'] = Pokemon.clean_pokemon_name(pokemon['Name'])
                pokemon['sprite'] = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon['Num']}.png"
                return jsonify(pokemon)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'DB error'}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/player_pokemon')
def get_player_pokemon():
    player_id = session.get('user_id')
    if not player_id:
        return jsonify({'error': 'Not logged in'}), 401

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT p.*
        FROM user_pokemon up
        JOIN pokemon p ON up.pokemon_id = p.id
        WHERE up.user_id = ? 
        LIMIT 1
    """, (player_id,))
    
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(row)
    else:
        return jsonify({'error': 'No starter Pokémon found'}), 404


