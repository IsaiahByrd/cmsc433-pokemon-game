from flask import render_template, jsonify, request, flash, redirect, url_for, session
from pokemonGame import app, get_db_connection
from pokemonGame.models import User, UserPokemon, Pokemon
import secrets
import string

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
    return render_template('menu/menu.html')

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
    # Check if user is logged in
    if 'user_id' not in session:
        flash("Please log in to access the battle arena.", "warning")
        return redirect(url_for('login'))
    return render_template('menu/battle/battle.html')

@app.route('/teambuilder')
def teambuilder():
    # Check if user is logged in
    if 'user_id' not in session:
        flash("Please log in to access the team builder.", "warning")
        return redirect(url_for('login'))
    return render_template('menu/teambuilder/teambuilder.html')

@app.route('/viewcollection')
def viewcollection():
    # Check if user is logged in
    if 'user_id' not in session:
        flash("Please log in to view your collection.", "warning")
        return redirect(url_for('login'))
    
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
        
        # Use high-quality still images instead of animated GIFs for better performance
        pokemon['sprite_url'] = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pokemon['Num']}.png"
        # Fallback to basic sprite if official artwork doesn't exist
        pokemon['fallback_sprite'] = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon['Num']}.png"
    
    # Calculate collection statistics
    total_pokemon = len(all_pokemon)
    collected_count = len(collected_pokemon_ids)
    collection_percentage = (collected_count / total_pokemon * 100) if total_pokemon > 0 else 0
    
    return render_template('menu/viewcollection/viewcollection.html', 
                         pokemon_list=all_pokemon,
                         total_pokemon=total_pokemon,
                         collected_count=collected_count,
                         collection_percentage=collection_percentage)

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
    cursor.execute("SELECT * FROM pokemon ORDER BY id")
    pokemon_data = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Clean Pokemon names before returning
    for pokemon in pokemon_data:
        if 'Name' in pokemon:
            pokemon['Name'] = Pokemon.clean_pokemon_name(pokemon['Name'])
    
    return jsonify(pokemon_data)
