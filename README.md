# Pokémon Flask Server

This project is a Flask-based web server for CMSC433. Follow the instructions below to set it up and run it locally.

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

### 4. Run the Flask Server
Make sure your environment is activated, then run:

```bash
python app.py
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







