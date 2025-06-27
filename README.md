<p align="left" style="display: flex; align-items: center;">
  <strong>Pokémon Battle</strong>
    <img src="https://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif" alt="Charizard"
        width="25"
        height="25">
</p>


This project is a Pokémon Game for CMSC433. Follow the instructions below to set it up and run it locally.

## Requirements

- Python 3.7+
- Git (to clone the repo)

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/IsaiahByrd/cmsc433-pokemon-game.git
cd cmsc433-pokemon-game
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
```

- On Windows, activate with:
```bash
venv\Scripts\activate
```
- On Mac/Linux, activate with:
```bash
source venv/bin/activate
```

You should now see (venv) in your terminal prompt.

### 3. Install Dependencies
Make sure you're in the project root (same level as requirements.txt), then run:
```bash
pip install -r requirements.txt
```

If you don't have a requirements.txt yet, generate it with:
```bash
pip freeze > requirements.txt
```

### 4. Instal XAMPP
* Follow the link to download xampp https://www.apachefriends.org/download.html
* On XAMPP Control Panel Start APACHE and Start MySQL
* Press Admin to the right of the start button for MySql in order to get to the phpMyAdmin page
* Click the SQL tab to the left of Status

### 5. Run the createAll.sql file
* Go back to the cloned repository and open the ***creatALL.SQL*** file
* Copy all the contents of the file
* Paste the content into the SQL tab in the phpMyAdmin page
* Click ***GO***

### 5. Run the Flask Server
Make sure your environment is activated, then run:

```bash
python db_setup.py # Only Needs to be run ONCE as it loads the pokemon into the database
python proj3.py  # Run Anytime you want to start the app locally
```

You should see output like:
* Running on http://127.0.0.1:5000/


### To Stop the Server
Use Ctrl + C in the terminal.

### Deactivate the Virtual Environment
After you're done, run:
```bash
deactivate
```







