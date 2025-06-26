const pokemonSprite = document.getElementById('pokemonSprite');

// Set the source and show the animated GIF
pokemonSprite.src = "https://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif";

pokemonSprite.onload = function () {
    // Show the image once it's loaded
    pokemonSprite.style.display = 'block';
    console.log('Pokemon sprite loaded successfully!');
};

pokemonSprite.onerror = function () {
    console.error('Failed to load Pokemon image');
    // Show fallback text
    document.getElementById('pokemon-container').innerHTML = '<p>Failed to load Pokemon sprite</p>';
};