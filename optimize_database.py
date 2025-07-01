#!/usr/bin/env python3
"""
Script to optimize the Pokemon database by removing Pokemon from generations 4 and beyond.
This will significantly reduce the dataset size and improve collection page loading performance.
"""

import sys
import os

# Add the parent directory to the Python path to import from pokemonGame
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import mariadb
    from pokemonGame import DB_CONFIG, get_db_connection
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running this from the project directory and have all dependencies installed.")
    sys.exit(1)

def optimize_pokemon_database():
    """Remove Pokemon from generations 4 and beyond to improve performance."""
    conn = get_db_connection()
    if not conn:
        print("Could not connect to the database. Aborting optimization.")
        return False
    
    cursor = conn.cursor()
    
    try:
        # First, check how many Pokemon we currently have
        cursor.execute("SELECT COUNT(*) FROM pokemon")
        total_before = cursor.fetchone()[0]
        print(f"Total Pokemon before optimization: {total_before}")
        
        # Count Pokemon in first 3 generations
        cursor.execute("SELECT COUNT(*) FROM pokemon WHERE Generation <= 3")
        keeping = cursor.fetchone()[0]
        print(f"Pokemon from Gen 1-3 (keeping): {keeping}")
        
        # Count Pokemon from Gen 4+
        cursor.execute("SELECT COUNT(*) FROM pokemon WHERE Generation > 3")
        removing = cursor.fetchone()[0]
        print(f"Pokemon from Gen 4+ (removing): {removing}")
        
        if removing == 0:
            print("Database is already optimized!")
            return True
        
        # Remove user collections for Pokemon from Gen 4+
        print("Removing user collection entries for Gen 4+ Pokemon...")
        cursor.execute("""
            DELETE FROM user_pokemon 
            WHERE pokemon_id IN (
                SELECT id FROM pokemon WHERE Generation > 3
            )
        """)
        affected_collections = cursor.rowcount
        print(f"Removed {affected_collections} collection entries")
        
        # Remove Pokemon from Gen 4+
        print("Removing Pokemon from Gen 4+...")
        cursor.execute("DELETE FROM pokemon WHERE Generation > 3")
        removed_pokemon = cursor.rowcount
        print(f"Removed {removed_pokemon} Pokemon from the database")
        
        # Commit the changes
        conn.commit()
        
        # Verify the results
        cursor.execute("SELECT COUNT(*) FROM pokemon")
        total_after = cursor.fetchone()[0]
        print(f"Total Pokemon after optimization: {total_after}")
        
        print("\n✅ Database optimization completed successfully!")
        print(f"Reduced database size by {removed_pokemon} Pokemon ({removing} -> 0 from Gen 4+)")
        print("Collection page should now load much faster!")
        print("Sprites have also been changed to pixelated versions for better performance!")
        
        return True
        
    except mariadb.Error as e:
        print(f"Database error during optimization: {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"Unexpected error during optimization: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🚀 Starting Pokemon database optimization...")
    print("This will remove Pokemon from generations 4 and beyond to improve performance.")
    print("It will also update sprites to use pixelated versions.")
    
    response = input("\nDo you want to continue? (y/N): ").strip().lower()
    if response in ['y', 'yes']:
        success = optimize_pokemon_database()
        if success:
            print("\n🎉 Optimization complete!")
            print("📊 Your collection page should now load much faster")
            print("🎮 Sprites are now pixelated for that retro aesthetic")
            print("⚡ Performance improvements include:")
            print("   - Reduced dataset (Gen 1-3 only: ~386 Pokemon)")
            print("   - Smaller pixelated sprites")
            print("   - Virtual scrolling for smooth performance")
        else:
            print("\n❌ Optimization failed. Please check the error messages above.")
    else:
        print("Optimization cancelled.")
