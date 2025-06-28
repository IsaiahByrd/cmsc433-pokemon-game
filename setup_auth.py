#!/usr/bin/env python3
"""
Setup script to create the users table and collection table in your Pokemon database.
Run this script before using the authentication system.
"""

import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from create_users_table import create_users_table
from create_collection_table import create_user_pokemon_table

if __name__ == "__main__":
    print("Setting up user authentication and collection system...")
    print("Creating users table...")
    
    try:
        create_users_table()
        print("✅ Users table created!")
        
        print("Creating user Pokemon collection table...")
        create_user_pokemon_table()
        print("✅ Collection table created!")
        
        print("\n🎉 Database setup complete!")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        print("Please check your MariaDB connection and try again.")
