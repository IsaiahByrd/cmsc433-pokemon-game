<p align="left" style="display: flex; align-items: center;">
  <strong>Pokémon Battle</strong>
    <img src="https://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif" alt="Charizard"
        width="25"
        height="25">
</p>


This project is a Pokémon Game for CMSC433 at UMBC. Follow the instructions below to set it up and run it locally.

## Requirements

- Python 3.7+
- Git (to clone the repo)
- XAMPP (for MariaDB + phpMyAdmin)
- MariaDB Connector/C (for installing the `mariadb` Python package)

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

### 3. Install MariaDB Connector/C (Required for Python ```mariadb```)
This step is required before running ``` pip install```.
- **macOs** (using Homebrew):
  ```bash
  brew install mariadb-connector-c
  ```
  Check if ```mariadb_config``` is installed
  ```bash
  which mariadb_config
  ```
  If you get this error after installing:

  ```mariadb_config not found```

  It's likely the tool is not on your system’s PATH. Run the following to fix it:
  ```bash
  echo 'export PATH="/opt/homebrew/opt/mariadb-connector-c/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  ```

  Then check again:
  ```bash
  which mariadb_config
  mariadb_config --version
  ```

  You should now see the path to mariadb_config and a version number.



- **Ubuntu/Debian:**
  ```bash
  sudo apt update
  sudo apt install libmariadb-dev
  ```
- **Windows:**

  **1.** Download [MariaDB Connector/C](https://mariadb.com/downloads/connectors/).

  **2.** Install it and make sure the path to ```mariadb_config``` is added to your environment variables.

  To confirm it's installed:
  ```bash
  which mariadb_config  # or `mariadb_config --version`
  ```

### 4. Install Python Dependencies
Make sure you're in the project root (same level as requirements.txt), then run:
```bash
pip install -r requirements.txt
```

If you don't have a requirements.txt yet, generate it with:
```bash
pip freeze > requirements.txt
```

### 5. Install XAMPP
* Download XAMPP: https://www.apachefriends.org/download.html
* Launch the XAMPP Control Panel
* Go to the Manage Servers tab
* Start Apache Web Server and MySQL Database
* Go to http://localhost/phpmyadmin/ in your browser

### 6. Load the Database via ```createAll.sql```
* Go back to the cloned repository and open the ***creatALL.SQL*** file
* Copy all the contents of the file
* Paste the content into the SQL tab in the phpMyAdmin page

### 7. Run the Flask Server
Make sure your virtual environment is still active.

Run the database setup (ONLY ONCE):
```bash
python db_setup.py # Only Needs to be run ONCE as it loads the pokemon into the database
```
Then run the app:
```bash
python proj3.py  # Run anytime you want to start the app locally
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







