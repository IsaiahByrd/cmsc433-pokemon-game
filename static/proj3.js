const titleSprite1 = document.getElementById('titleSprite1');
const titleSprite2 = document.getElementById('titleSprite2');
const pokemonTitle = document.getElementById('pokemonTitle');

// Set GIF sources for both sprites
titleSprite1.src = "https://img.pokemondb.net/sprites/black-white/anim/normal/blastoise.gif";
titleSprite2.src = "https://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif";

// set the title text
pokemonTitle.src = "static/pokemon-title.png";

// Show sprites and apply styling once they load
titleSprite1.onload = function() {
    titleSprite1.style.display = 'block';
    titleSprite1.style.transform = 'scaleX(-1)'; // flip the first sprite horizontally
    console.log('Blastoise sprite loaded and flipped!');
};

titleSprite2.onload = function() {
    titleSprite2.style.display = 'block';
    console.log('Charizard sprite loaded!');
};

// Error handling
titleSprite1.onerror = function() {
    console.error('Failed to load Blastoise sprite');
};

titleSprite2.onerror = function() {
    console.error('Failed to load Charizard sprite');
};


