// Player's stats stats
var playerPokemon = {
    name: "",
    hp: 0,
    attack: 0,
    spAttack: 0,
    speed: 0,
    maxHp: 0,
    id: null,
    num: null
};

//opponent stats
var opponent = {
    id: null,
    name: "",
    hp: 0,
    maxHp: 0,
    attack: 0,
    spAttack: 0,
    speed: 0
};

window.onload = function () {
    // Load player Pokemon from db
    fetch('/api/player_pokemon')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            playerPokemon.name = data.Name;
            playerPokemon.hp = data.HP;
            playerPokemon.maxHp = data.HP;
            playerPokemon.attack = data.Attack;
            playerPokemon.spAttack = data.SpAttack;
            playerPokemon.speed = data.Speed;
            playerPokemon.id = data.id;
            playerPokemon.num = data.Num;

            // Set player Pokemon info in HTML
            document.getElementById('player-pokemon-name').textContent = playerPokemon.name;
            document.getElementById('player-hp').textContent = "HP: " + playerPokemon.hp;
            document.getElementById('player-pokemon-sprite').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + playerPokemon.num + ".png";
            document.getElementById('player-attack').textContent = "Damage: " + playerPokemon.attack;
            document.getElementById('player-spattack').textContent = "Sp. Atk: " + playerPokemon.spAttack;
            document.getElementById('player-speed').textContent = "Speed: " + playerPokemon.speed;

        })
        .catch(function (error) {
            console.log("Failed to load player Pokémon:", error);
        });

    // Load random opponent from DB
    fetch('/api/random_pokemon')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            opponent.id = data.id;
            opponent.name = data.Name;
            opponent.hp = data.HP;
            opponent.maxHp = data.HP;
            opponent.attack = data.Attack;
            opponent.speed = data.Speed;

            document.getElementById('opponent-pokemon-name').textContent = opponent.name;
            document.querySelector('.opponentPokemon').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + data.Num + ".png";
            document.getElementById('opponent-hp').textContent = "HP: " + opponent.hp;
            document.getElementById('opponent-attack').textContent = "Damage: " + opponent.attack;
            document.getElementById('opponent-speed').textContent = "Speed: " + opponent.speed;
        })
        .catch(function (error) {
            console.log("Failed to load opponent:", error);
        });

    document.getElementById('attack-btn').addEventListener('click', attack);
    document.getElementById('spattack-btn').addEventListener('click', specialAttack);
    document.getElementById('catch-btn').addEventListener('click', catchPokemon);
    document.getElementById('home-btn').addEventListener('click', function () {
        window.location.href = "/menu";
    });

    document.getElementById('fight-another-btn').addEventListener('click', function () {
        window.location.reload();
    });

    document.getElementById('go-home-btn').addEventListener('click', function () {
        window.location.href = "/menu";
    });
};


// Attack function
function attack() {
    if (opponent.hp <= 0) {
        alert("Opponent has already fainted.");
        return;
    }
    if (playerPokemon.hp <= 0) {
        alert("Your Pokémon has fainted.");
        return;
    }

    var playerGoesFirst = playerPokemon.speed >= opponent.speed;

    if (playerGoesFirst) {
        opponent.hp -= playerPokemon.attack;
        if (opponent.hp < 0) opponent.hp = 0;
        updateOpponentHP();

        if (opponent.hp === 0) {
            alert("You defeated " + opponent.name + "!");
            endBattle();
            return;
        }

        playerPokemon.hp -= opponent.attack;
        if (playerPokemon.hp < 0) playerPokemon.hp = 0;
        updatePlayerHP();

        if (playerPokemon.hp === 0) {
            alert(playerPokemon.name + " has fainted!");
            endBattle();
            return;
        }

    } else {
        playerPokemon.hp -= opponent.attack;
        if (playerPokemon.hp < 0) playerPokemon.hp = 0;
        updatePlayerHP();

        if (playerPokemon.hp === 0) {
            alert(playerPokemon.name + " has fainted!");
            endBattle();
            return;
        }

        opponent.hp -= playerPokemon.attack;
        if (opponent.hp < 0) opponent.hp = 0;
        updateOpponentHP();

        if (opponent.hp === 0) {
            alert("You defeated " + opponent.name + "!");
            endBattle();
            return;
        }
    }
}

function specialAttack() {
    if (opponent.hp <= 0 || playerPokemon.hp <= 0) {
        alert("Battle is over.");
        return;
    }

    opponent.hp -= playerPokemon.spAttack;
    if (opponent.hp < 0) opponent.hp = 0;
    updateOpponentHP();

    if (opponent.hp === 0) {
        alert("You defeated " + opponent.name + "!");
        endBattle();
        return;
    }

    playerPokemon.hp -= opponent.attack;
    if (playerPokemon.hp < 0) playerPokemon.hp = 0;
    updatePlayerHP();

    if (playerPokemon.hp === 0) {
        alert(playerPokemon.name + " has fainted!");
        endBattle();
    }
}


// Catch function
function catchPokemon() {
    var hpRatio = opponent.hp / opponent.maxHp;
    if (hpRatio >= 0.25) {
        alert("Opponent is too strong to catch! Weaken it more.");
        return;
    }

    fetch("/catch/" + opponent.id, {
        method: 'POST'
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        if (data.success) {
            alert("You caught " + opponent.name + "!");
            document.getElementById('post-battle-options').style.display = 'block';
        } else {
            alert("Failed to catch Pokémon.");
        }
    })
    .catch(function (error) {
        console.log("Error catching Pokémon:", error);
    });
}


// Helper to update opponent HP in UI
function updateOpponentHP() {
    document.getElementById('opponent-hp').textContent = "HP: " + opponent.hp;
    var bar = document.querySelector('.opponent-health');
    if (bar) {
        bar.style.width = (opponent.hp / opponent.maxHp * 100) + "%";
    }
}

// Helper to update player HP in UI
function updatePlayerHP() {
    document.getElementById('player-hp').textContent = "HP: " + playerPokemon.hp;
    var bar = document.querySelector('.health');
    if (bar) {
        bar.style.width = (playerPokemon.hp / playerPokemon.maxHp * 100) + "%";
    }
}


function endBattle() {
    document.getElementById('post-battle-options').style.display = 'block';
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('spattack-btn').disabled = true;
    document.getElementById('catch-btn').disabled = true;
}

