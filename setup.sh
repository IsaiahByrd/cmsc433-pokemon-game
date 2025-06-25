#!/bin/bash

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
fi


source venv/bin/activate


pip install -r requirements.txt


export FLASK_APP=app.py
export FLASK_ENV=development
flask run
