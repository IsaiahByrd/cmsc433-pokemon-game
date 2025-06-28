#!/usr/bin/env python3
"""
Test script to verify Pokemon name cleaning functionality.
This script tests the clean_pokemon_name method with various malformed names.
"""

def clean_pokemon_name(name):
    """Clean malformed Pokemon names, especially Mega Pokemon names."""
    if not name:
        return name
        
    original_name = name.strip()
    
    # Fix malformed Mega Pokemon names like "CharizardMega Charizard Y"
    if 'Mega' in original_name and not original_name.startswith('Mega'):
        # Split on 'Mega' to separate the parts
        parts = original_name.split('Mega', 1)
        if len(parts) == 2:
            base_name = parts[0].strip()
            mega_suffix = parts[1].strip()
            
            # Common patterns to handle:
            # "CharizardMega Charizard Y" -> "Mega Charizard Y"
            # "BlastoiseMega Blastoise" -> "Mega Blastoise"
            
            # If the suffix already contains the base name, use it
            if base_name.lower() in mega_suffix.lower():
                return f"Mega {mega_suffix}"
            else:
                # If suffix is just a form indicator (X, Y, etc.), combine properly
                if mega_suffix.strip() in ['X', 'Y', 'Z']:
                    return f"Mega {base_name} {mega_suffix}"
                else:
                    return f"Mega {base_name} {mega_suffix}".strip()
    
    return original_name

def test_name_cleaning():
    """Test the Pokemon name cleaning functionality."""
    
    test_cases = [
        # (input_name, expected_output)
        ("CharizardMega Charizard X", "Mega Charizard X"),
        ("CharizardMega Charizard Y", "Mega Charizard Y"),
        ("BlastoiseMega Blastoise", "Mega Blastoise"),
        ("VenusaurMega Venusaur", "Mega Venusaur"),
        ("AlakazamMega Alakazam", "Mega Alakazam"),
        ("GengarMega Gengar", "Mega Gengar"),
        ("KangaskhanMega Kangaskhan", "Mega Kangaskhan"),
        ("PinsirMega Pinsir", "Mega Pinsir"),
        ("GyaradosMega Gyarados", "Mega Gyarados"),
        ("AerodactylMega Aerodactyl", "Mega Aerodactyl"),
        ("MewtwoMega Mewtwo X", "Mega Mewtwo X"),
        ("MewtwoMega Mewtwo Y", "Mega Mewtwo Y"),
        ("AmpharosMega Ampharos", "Mega Ampharos"),
        ("SteelixMega Steelix", "Mega Steelix"),
        ("ScizorMega Scizor", "Mega Scizor"),
        ("HeracrossMega Heracross", "Mega Heracross"),
        ("HoundoomMega Houndoom", "Mega Houndoom"),
        ("TyranitarMega Tyranitar", "Mega Tyranitar"),
        ("SceptileMega Sceptile", "Mega Sceptile"),
        ("BlazikenMega Blaziken", "Mega Blaziken"),
        ("SwampertMega Swampert", "Mega Swampert"),
        ("GardevoirMega Gardevoir", "Mega Gardevoir"),
        ("SableyeMega Sableye", "Mega Sableye"),
        ("MawileMega Mawile", "Mega Mawile"),
        ("AggronMega Aggron", "Mega Aggron"),
        ("MedichamMega Medicham", "Mega Medicham"),
        ("ManectricMega Manectric", "Mega Manectric"),
        ("SharpedoMega Sharpedo", "Mega Sharpedo"),
        ("CameruptMega Camerupt", "Mega Camerupt"),
        ("AltariaMega Altaria", "Mega Altaria"),
        ("BanetteMega Banette", "Mega Banette"),
        ("AbsolMega Absol", "Mega Absol"),
        ("GlalieMega Glalie", "Mega Glalie"),
        ("SalamenceMega Salamence", "Mega Salamence"),
        ("MetagrossMega Metagross", "Mega Metagross"),
        ("LatiositeMega Latios", "Mega Latios"),
        ("LatiasMega Latias", "Mega Latias"),
        ("RayquazaMega Rayquaza", "Mega Rayquaza"),
        ("LopunnyMega Lopunny", "Mega Lopunny"),
        ("GarchompMega Garchomp", "Mega Garchomp"),
        ("LucarioMega Lucario", "Mega Lucario"),
        ("AbomasnowMega Abomasnow", "Mega Abomasnow"),
        ("GalladeMega Gallade", "Mega Gallade"),
        ("AudinoMega Audino", "Mega Audino"),
        ("DiancieMega Diancie", "Mega Diancie"),
        # Normal names should remain unchanged
        ("Pikachu", "Pikachu"),
        ("Charizard", "Charizard"),
        ("Mega Charizard X", "Mega Charizard X"),  # Already correct
        ("Mega Charizard Y", "Mega Charizard Y"),  # Already correct
        ("", ""),  # Empty string
        (None, None),  # None input
        # Edge cases
        ("SomethingMega X", "Mega Something X"),
        ("TestMega Test Form", "Mega Test Form"),
    ]
    
    print("Testing Pokemon name cleaning functionality...")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for input_name, expected in test_cases:
        result = clean_pokemon_name(input_name)
        
        if result == expected:
            print(f"✓ PASS: '{input_name}' -> '{result}'")
            passed += 1
        else:
            print(f"✗ FAIL: '{input_name}' -> '{result}' (expected: '{expected}')")
            failed += 1
    
    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed!")
        return True
    else:
        print(f"❌ {failed} test(s) failed.")
        return False

import sys

if __name__ == "__main__":
    success = test_name_cleaning()
    sys.exit(0 if success else 1)
