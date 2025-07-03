# Pokémon Battle - CMSC433

This project is a Pokémon Game for CMSC433 at UMBC. Follow the instructions below to set it up and run it locally.

## Requirements

- Python 3.7+
- Git (to clone the repo)
- XAMPP (for MariaDB + phpMyAdmin)
- MariaDB Connector/C (for installing the `mariadb` Python package)

---

## Step-by-Step Setup

### 1. Extract the Zipped Folder
- Download and unzip the project folder.
- Open a new terminal window and open the unzipped folder ex: ```bash cd ../cmsc433-pokemon-game```

### 2. Create a Virtual Environment
```bash
python -m venv venv
```
#### For MacOS:
```bash
python3 -m venv venv
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

## **ONLY DO STEP 3 IF YOU ARE ON A MacOS OR Linux SYSTEM, OTHERWISE, CONTINUE TO STEP 4**
### 3. Install MariaDB Connector/C **(REQUIRED FOR MacOS & Linux ONLY)**
This step is required before running ``` pip install -r requirements.txt```.
- **MacOs** (using Homebrew):
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

### 4. Install Python Dependencies
Make sure you're still in the project folder (with requirements.txt) and your virtual environment is active:
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

### 6. Load the Database via `proj3.sql` **ONLY ONCE**
* Open the `proj3.sql` file in a text editor
* Copy all the contents of the file
* Paste the content into the SQL tab in the phpMyAdmin page and execute it (only has to be done once)

This sets up the database structure and initial data.

### 7. Set Up the Database and Authentication Tables
Run these setup scripts **ONCE** when first setting up the project:

```bash
python db_setup.py        # Loads Pokémon data from Excel into the database
python setup_auth.py      # Creates user and collection tables
```

### 8. Run the Flask Application
Make sure your virtual environment is still active, then run:

```bash
python proj3.py
```

You should see output like:
```
* Running on http://127.0.0.1:5000/
```

### To Stop the Server
Use `Ctrl + C` in the terminal where the Flask app is running.

### Deactivate the Virtual Environment
After you're done, run:
```bash
deactivate
```







