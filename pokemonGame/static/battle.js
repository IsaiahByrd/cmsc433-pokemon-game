// users stats
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

//opening screen
window.onload = function () {
    // Load player Pokemon from db
    fetch('/api/player_pokemon')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("Player Pokemon data received:", data);
            playerPokemon.name = data.Name;
            // Enhanced scaling for starter Pokemon to make battles more engaging
            // Higher HP multiplier and better minimums for survivability
            playerPokemon.hp = Math.max(120, Math.floor(data.HP * 2.5));
            playerPokemon.maxHp = Math.max(120, Math.floor(data.HP * 2.5));
            // Better attack scaling for competitive battles
            playerPokemon.attack = Math.max(30, Math.floor(data.Attack * 1.2));
            playerPokemon.spAttack = Math.max(30, Math.floor((data.SpAttack || data.Attack) * 1.2));
            playerPokemon.speed = Math.max(25, data.Speed);
            playerPokemon.id = data.id;
            playerPokemon.num = data.Num;
            console.log("Player Pokemon object after enhanced scaling:", playerPokemon);

            // Set player Pokemon info in HTML
            document.getElementById('player-pokemon-name').textContent = playerPokemon.name;
            document.getElementById('player-hp').textContent = "HP: " + playerPokemon.hp + "/" + playerPokemon.maxHp;
            // Use back sprite for player's Pokemon with fallback
            var playerSprite = document.getElementById('player-pokemon-sprite');
            var backSpriteUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/" + playerPokemon.num + ".png";
            var frontSpriteUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + playerPokemon.num + ".png";
            
            playerSprite.src = backSpriteUrl;
            playerSprite.onerror = function() {
                console.log("Back sprite not found, using front sprite for Pokemon", playerPokemon.num);
                playerSprite.src = frontSpriteUrl;
                playerSprite.style.transform = "scaleX(-1)"; // Flip horizontally if using front sprite
            };
            
            document.getElementById('player-attack').textContent = "ATK: " + playerPokemon.attack;
            document.getElementById('player-spattack').textContent = "SP.ATK: " + playerPokemon.spAttack;
            document.getElementById('player-speed').textContent = "SPD: " + playerPokemon.speed;

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
            console.log("Opponent Pokemon data received:", data);
            opponent.id = data.id;
            opponent.name = data.Name;
            // Enhanced opponent scaling to match player improvements
            // Reasonable HP that provides a good challenge
            opponent.hp = Math.max(90, Math.floor(data.HP * 1.8));
            opponent.maxHp = Math.max(90, Math.floor(data.HP * 1.8));
            // Balanced attack that won't one-shot but still threatens
            opponent.attack = Math.max(18, Math.floor(data.Attack * 0.8));
            opponent.speed = Math.max(15, Math.floor(data.Speed * 0.9));
            console.log("Opponent Pokemon object after enhanced scaling:", opponent);

            document.getElementById('opponent-pokemon-name').textContent = opponent.name;
            document.getElementById('opponent-pokemon-sprite').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + data.Num + ".png";
            document.getElementById('opponent-hp').textContent = "HP: " + opponent.hp + "/" + opponent.maxHp;
            document.getElementById('opponent-attack').textContent = "ATK: " + opponent.attack;
            document.getElementById('opponent-speed').textContent = "SPD: " + opponent.speed;
        })
        .catch(function (error) {
            console.log("Failed to load opponent:", error);
        });

    document.getElementById('attack-btn').addEventListener('click', attack);
    document.getElementById('spattack-btn').addEventListener('click', specialAttack);
    document.getElementById('catch-btn').addEventListener('click', catchPokemon);
    document.getElementById('heal-btn').addEventListener('click', healPokemon);
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
        showBattleMessage("Opponent has already fainted!");
        return;
    }
    if (playerPokemon.hp <= 0) {
        showBattleMessage("Your Pokémon has fainted!");
        return;
    }

    // Disable buttons during attack sequence
    disableBattleButtons();

    console.log("=== ATTACK STARTED ===");
    console.log("Before attack - Player HP:", playerPokemon.hp, "Opponent HP:", opponent.hp);
    
    var playerGoesFirst = playerPokemon.speed >= opponent.speed;
    console.log("Player goes first:", playerGoesFirst);

    if (playerGoesFirst) {
        // PLAYER ATTACKS FIRST
        executePlayerAttack(() => {
            if (opponent.hp > 0) {
                // Enemy counterattack after 2 seconds
                setTimeout(() => {
                    executeEnemyAttack(() => {
                        enableBattleButtons();
                    });
                }, 2000);
            } else {
                enableBattleButtons();
            }
        });
    } else {
        // ENEMY ATTACKS FIRST
        executeEnemyAttack(() => {
            if (playerPokemon.hp > 0) {
                // Player counterattack after 2 seconds
                setTimeout(() => {
                    executePlayerAttack(() => {
                        enableBattleButtons();
                    });
                }, 2000);
            } else {
                enableBattleButtons();
            }
        });
    }
}

function executePlayerAttack(callback) {
    console.log("--- PLAYER'S TURN ---");
    // Better damage calculation: base damage + random variance
    var baseDamage = Math.floor(playerPokemon.attack * 0.8);
    var variance = Math.floor(Math.random() * Math.floor(playerPokemon.attack * 0.4));
    var damage = Math.max(8, baseDamage + variance);
    
    // Critical hit chance (15%)
    var isCritical = Math.random() < 0.15;
    if (isCritical) {
        damage = Math.floor(damage * 1.5);
    }
    
    console.log("Player attack damage calculated:", damage, "(base:", baseDamage, "+ variance:", variance, isCritical ? "CRITICAL HIT!" : "", ")");
    
    // DAMAGE THE OPPONENT
    opponent.hp -= damage;
    if (opponent.hp < 0) opponent.hp = 0;
    console.log("Opponent HP after player attack:", opponent.hp);
    
    updateOpponentHP();
    var message = isCritical ? 
        "💥 CRITICAL HIT! " + playerPokemon.name + " devastates " + opponent.name + " for " + damage + " damage!" :
        "💥 " + playerPokemon.name + " attacks " + opponent.name + " for " + damage + " damage!";
    showBattleMessage(message);

    if (opponent.hp === 0) {
        showBattleMessage("🎉 You defeated " + opponent.name + "!", 3000);
        endBattle();
        return;
    }
    
    if (callback) callback();
}

function executeEnemyAttack(callback) {
    console.log("--- OPPONENT'S TURN ---");
    // Reduced enemy damage to prevent one-shots
    var baseDamage = Math.floor(opponent.attack * 0.6);
    var variance = Math.floor(Math.random() * Math.floor(opponent.attack * 0.3));
    var enemyDamage = Math.max(5, baseDamage + variance);
    console.log("Enemy attack damage calculated:", enemyDamage, "(base:", baseDamage, "+ variance:", variance, ")");
    
    // DAMAGE THE PLAYER
    playerPokemon.hp -= enemyDamage;
    if (playerPokemon.hp < 0) playerPokemon.hp = 0;
    console.log("Player HP after enemy attack:", playerPokemon.hp);
    
    updatePlayerHP();
    showBattleMessage("⚡ " + opponent.name + " attacks " + playerPokemon.name + " for " + enemyDamage + " damage!");

    if (playerPokemon.hp === 0) {
        showBattleMessage("💀 " + playerPokemon.name + " has fainted!", 3000);
        endBattle();
        return;
    }
    
    if (callback) callback();
}

function disableBattleButtons() {
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('spattack-btn').disabled = true;
    document.getElementById('catch-btn').disabled = true;
    const healBtn = document.getElementById('heal-btn');
    if (healBtn) healBtn.disabled = true;
}

function enableBattleButtons() {
    document.getElementById('attack-btn').disabled = false;
    document.getElementById('spattack-btn').disabled = false;
    document.getElementById('catch-btn').disabled = false;
    const healBtn = document.getElementById('heal-btn');
    if (healBtn && healingUses > 0) healBtn.disabled = false;
}

function specialAttack() {
    if (opponent.hp <= 0 || playerPokemon.hp <= 0) {
        showBattleMessage("Battle is over!");
        return;
    }

    // Disable buttons during attack sequence
    disableBattleButtons();

    console.log("=== SPECIAL ATTACK STARTED ===");
    console.log("Before special attack - Player HP:", playerPokemon.hp, "Opponent HP:", opponent.hp);
    
    // Special attack always goes first (ignoring speed)
    executePlayerSpecialAttack(() => {
        if (opponent.hp > 0) {
            // Enemy counterattack after 2 seconds
            setTimeout(() => {
                executeEnemyAttack(() => {
                    enableBattleButtons();
                });
            }, 2000);
        } else {
            enableBattleButtons();
        }
    });
}

function executePlayerSpecialAttack(callback) {
    console.log("--- PLAYER'S SPECIAL ATTACK ---");
    // Special attack does more damage but uses SP.ATK stat
    var baseDamage = Math.floor(playerPokemon.spAttack * 1.2);
    var variance = Math.floor(Math.random() * Math.floor(playerPokemon.spAttack * 0.5));
    var spDamage = Math.max(12, baseDamage + variance);
    console.log("Special attack damage calculated:", spDamage, "(base:", baseDamage, "+ variance:", variance, ")");
    
    // DAMAGE THE OPPONENT
    opponent.hp -= spDamage;
    if (opponent.hp < 0) opponent.hp = 0;
    console.log("Opponent HP after special attack:", opponent.hp);
    
    updateOpponentHP();
    showBattleMessage("✨ " + playerPokemon.name + " uses Special Attack on " + opponent.name + " for " + spDamage + " damage!");

    if (opponent.hp === 0) {
        showBattleMessage("🎉 You defeated " + opponent.name + "!", 3000);
        endBattle();
        return;
    }
    
    if (callback) callback();
}


// Catch function
function catchPokemon() {
    var hpRatio = opponent.hp / opponent.maxHp;
    if (hpRatio >= 0.25) {
        showBattleMessage("Opponent is too strong to catch! Weaken it more (HP must be below 25%)!");
        return;
    }

    // Disable buttons during catch attempt
    document.getElementById('catch-btn').disabled = true;
    showBattleMessage("Throwing Pokéball...");

    fetch("/catch/" + opponent.id, {
        method: 'POST'
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        document.getElementById('catch-btn').disabled = false;
        if (data.success) {
            showBattleMessage("Success! You caught " + opponent.name + "!", 4000);
            setTimeout(() => {
                endBattle();
            }, 2000);
        } else {
            showBattleMessage("Failed to catch " + opponent.name + ". Try again!");
        }
    })
    .catch(function (error) {
        document.getElementById('catch-btn').disabled = false;
        console.log("Error catching Pokémon:", error);
        showBattleMessage("Error occurred while catching Pokémon!");
    });
}


// Healing mechanic
let healingUses = 3;

function healPokemon() {
    if (healingUses <= 0) {
        showBattleMessage("❌ No healing items left!");
        return;
    }
    
    if (playerPokemon.hp >= playerPokemon.maxHp) {
        showBattleMessage("❤️ " + playerPokemon.name + " is already at full health!");
        return;
    }
    
    // Disable buttons during heal
    disableBattleButtons();
    
    // Heal 30-50% of max HP
    var healAmount = Math.floor(playerPokemon.maxHp * (0.3 + Math.random() * 0.2));
    playerPokemon.hp = Math.min(playerPokemon.maxHp, playerPokemon.hp + healAmount);
    healingUses--;
    
    updatePlayerHP();
    updateHealButton();
    
    showBattleMessage("💚 " + playerPokemon.name + " healed " + healAmount + " HP!");
    
    // Enemy gets a free attack when you heal
    setTimeout(() => {
        executeEnemyAttack(() => {
            enableBattleButtons();
        });
    }, 1500);
}

function updateHealButton() {
    const healBtn = document.getElementById('heal-btn');
    if (healBtn) {
        if (healingUses > 0) {
            healBtn.textContent = `Heal (${healingUses} uses)`;
            healBtn.disabled = false;
        } else {
            healBtn.textContent = 'No Heals Left';
            healBtn.disabled = true;
            healBtn.style.opacity = '0.5';
        }
    }
}

// Helper to update opponent HP in UI
function updateOpponentHP() {
    console.log("Updating opponent HP - Opponent object:", opponent);
    document.getElementById('opponent-hp').textContent = "HP: " + opponent.hp + "/" + opponent.maxHp;
    var bar = document.getElementById('opponent-health-fill');
    if (bar) {
        var percentage = (opponent.hp / opponent.maxHp * 100);
        bar.style.width = percentage + "%";
        console.log("Opponent HP bar updated - Percentage:", percentage);
        
        // Change color based on health percentage
        if (percentage > 60) {
            bar.style.background = "linear-gradient(90deg, #50C878, #90EE90)";
        } else if (percentage > 25) {
            bar.style.background = "linear-gradient(90deg, #FFD700, #FFA500)";
        } else {
            bar.style.background = "linear-gradient(90deg, #FF6B35, #FF4444)";
        }
    }
}

// Helper to update player HP in UI
function updatePlayerHP() {
    console.log("Updating player HP - Player object:", playerPokemon);
    document.getElementById('player-hp').textContent = "HP: " + playerPokemon.hp + "/" + playerPokemon.maxHp;
    var bar = document.getElementById('player-health-fill');
    if (bar) {
        var percentage = (playerPokemon.hp / playerPokemon.maxHp * 100);
        bar.style.width = percentage + "%";
        console.log("Player HP bar updated - Percentage:", percentage);
        
        // Change color based on health percentage
        if (percentage > 60) {
            bar.style.background = "linear-gradient(90deg, #50C878, #90EE90)";
        } else if (percentage > 25) {
            bar.style.background = "linear-gradient(90deg, #FFD700, #FFA500)";
        } else {
            bar.style.background = "linear-gradient(90deg, #FF6B35, #FF4444)";
        }
    }
}

// Show battle message with animation
function showBattleMessage(message, duration = 2000) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.battle-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'battle-message';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.opacity = '0';
    messageDiv.style.transition = 'opacity 0.3s ease';
    
    document.body.appendChild(messageDiv);
    
    // Fade in
    setTimeout(() => {
        messageDiv.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, duration);
}


function endBattle() {
    document.getElementById('post-battle-overlay').classList.remove('hidden');
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('spattack-btn').disabled = true;
    document.getElementById('catch-btn').disabled = true;
    // Disable heal button too
    const healBtn = document.getElementById('heal-btn');
    if (healBtn) healBtn.disabled = true;
}

