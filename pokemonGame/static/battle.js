// Define Pikachu's stats
var pikachu = {
    name: "Pikachu",
    hp: 100,
    attack: 55
};

// Placeholder for opponent stats
var opponent = {
    id: null,
    name: "",
    hp: 0,
    maxHp: 0
};

// This runs when the page loads
window.onload = function() {
    fetch('/api/random_pokemon')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            opponent.id = data.id;
            opponent.name = data.Name;
            opponent.hp = data.HP;
            opponent.maxHp = data.HP;

            document.getElementById('opponent-name').textContent = opponent.name;
            document.getElementById('opponent-sprite').src =
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + data.Num + ".png";
            document.getElementById('opponent-hp').textContent = "HP: " + opponent.hp;
        })
        .catch(function(error) {
            console.log("Failed to load opponent:", error);
        });

    document.getElementById('attack-btn').addEventListener('click', attack);
    document.getElementById('catch-btn').addEventListener('click', catchPokemon);
};

// Function to attack opponent
function attack() {
    if (opponent.hp <= 0) {
        alert("Opponent has already fainted.");
        return;
    }

    opponent.hp = opponent.hp - pikachu.attack;
    if (opponent.hp < 0) {
        opponent.hp = 0;
    }

    document.getElementById('opponent-hp').textContent = "HP: " + opponent.hp;

    if (opponent.hp === 0) {
        alert("You defeated " + opponent.name + "!");
    }
}

// Function to try catching the opponent
function catchPokemon() {
    var hpRatio = opponent.hp / opponent.maxHp;
    if (hpRatio >= 0.25) {
        alert("Opponent is too strong to catch! Weaken it more.");
        return;
    }

    fetch("/catch/" + opponent.id, {
        method: 'POST'
    })
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        if (data.success) {
            alert("You caught " + opponent.name + "!");
        } else {
            alert("Failed to catch Pokémon.");
        }
    })
    .catch(function(error) {
        console.log("Error catching Pokémon:", error);
    });
}
