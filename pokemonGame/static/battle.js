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

let switchModal, pokemonOptionsContainer;

//opening screen
window.onload = function () {
  // — grab modal elements —
  switchModal = document.getElementById('switch-modal');
  pokemonOptionsContainer = document.getElementById('pokemon-options');

  if (typeof playerTeam !== 'undefined' && playerTeam.length > 0) {
    const p = playerTeam[currentPokemonIndex];

    // 2) Compute stats into your working object…
    playerPokemon.name     = p.Name;
    playerPokemon.hp       = Math.max(120, Math.floor(p.HP * 2.5));
    playerPokemon.maxHp    = playerPokemon.hp;
    playerPokemon.attack   = Math.max(30,  Math.floor(p.Attack * 1.2));
    playerPokemon.spAttack = Math.max(30,  Math.floor((p.SpAttack || p.Attack) * 1.2));
    playerPokemon.speed    = Math.max(25,  p.Speed);
    playerPokemon.id       = p.id;
    playerPokemon.num      = p.Num;

    // 3) **Save them back** into the same slot so you don’t lose HP on switches
    p.hp       = playerPokemon.hp;
    p.maxHp    = playerPokemon.maxHp;
    p.attack   = playerPokemon.attack;
    p.spAttack = playerPokemon.spAttack;
    p.speed    = playerPokemon.speed;

    document.getElementById('player-pokemon-name').textContent = playerPokemon.name;
    document.getElementById('player-hp').textContent = `HP: ${playerPokemon.hp}/${playerPokemon.maxHp}`;
    document.getElementById('player-health-fill').style.width = (playerPokemon.hp / playerPokemon.maxHp * 100) + '%';
    document.getElementById('player-attack').textContent = `ATK: ${playerPokemon.attack}`;
    document.getElementById('player-spattack').textContent= `SP.ATK: ${playerPokemon.spAttack}`;
    document.getElementById('player-speed').textContent = `SPD: ${playerPokemon.speed}`;

    const playerSprite = document.getElementById('player-pokemon-sprite');
    const backUrl  = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${playerPokemon.num}.png`;
    const frontUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerPokemon.num}.png`;
    playerSprite.src = backUrl;
    playerSprite.onerror = () => {
      playerSprite.src = frontUrl;
      playerSprite.style.transform = 'scaleX(-1)';
    };
  }

  fetch('/api/random_pokemon')
    .then(res => res.json())
    .then(data => {
      opponent.id     = data.id;
      opponent.name   = data.Name;
      opponent.hp     = Math.max(90,  Math.floor(data.HP  * 1.8));
      opponent.maxHp  = opponent.hp;
      opponent.attack = Math.max(18,  Math.floor(data.Attack * 0.8));
      opponent.speed  = Math.max(15,  Math.floor(data.Speed  * 0.9));

      document.getElementById('opponent-pokemon-name').textContent = opponent.name;
      document.getElementById('opponent-pokemon-sprite').src      =
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.Num}.png`;
      document.getElementById('opponent-hp').textContent    = `HP: ${opponent.hp}/${opponent.maxHp}`;
      document.getElementById('opponent-attack').textContent= `ATK: ${opponent.attack}`;
      document.getElementById('opponent-speed').textContent = `SPD: ${opponent.speed}`;
    })
    .catch(err => console.error('Failed to load opponent:', err));

  document.getElementById('attack-btn').addEventListener('click', attack);
  document.getElementById('spattack-btn').addEventListener('click', specialAttack);
  document.getElementById('catch-btn').addEventListener('click', catchPokemon);
  document.getElementById('heal-btn').addEventListener('click', healPokemon);
  document.getElementById('home-btn').addEventListener('click', () => window.location.href = '/menu');
  document.getElementById('fight-another-btn').addEventListener('click', () => window.location.reload());
  document.getElementById('go-home-btn').addEventListener('click', () => window.location.href = '/menu');
  document.getElementById('switch-btn').addEventListener('click', openSwitchModal);
  document.getElementById('cancel-switch-btn').addEventListener('click', () => {
    switchModal.classList.add('hidden');
  });

  const switchBtn = document.getElementById('switch-btn');
  if (switchBtn) {
    switchBtn.disabled         = false;
    switchBtn.style.opacity    = '1';
    switchBtn.style.cursor     = 'pointer';
    switchBtn.style.pointerEvents = 'auto';
  }
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
  document.getElementById('attack-btn').disabled   = true;
  document.getElementById('spattack-btn').disabled = true;
  document.getElementById('catch-btn').disabled    = true;

  const healBtn = document.getElementById('heal-btn');
  if (healBtn) healBtn.disabled = true;

}


function enableBattleButtons() {
  document.getElementById('attack-btn').disabled   = false;
  document.getElementById('spattack-btn').disabled = false;
  document.getElementById('catch-btn').disabled    = false;

  const healBtn = document.getElementById('heal-btn');
  if (healBtn && healingUses > 0) healBtn.disabled = false;

  // — re-enable switch-btn on every “end of sequence” —
  const switchBtn = document.getElementById('switch-btn');
  if (switchBtn) {
    switchBtn.disabled         = false;
    switchBtn.style.opacity    = '1';
    switchBtn.style.cursor     = 'pointer';
    switchBtn.style.pointerEvents = 'auto';
  }
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
    const healBtn = document.getElementById('heal-btn');
    if (healBtn) healBtn.disabled = true;
}

function openSwitchModal() {
  const switchModal = document.getElementById('switch-modal');
  const container   = document.getElementById('pokemon-options');

  container.innerHTML = '';
  playerTeam.forEach((poke, idx) => {
    if (idx !== currentPokemonIndex && (poke.hp ?? 1) > 0) {
      const btn = document.createElement('button');
      btn.textContent = `${poke.Name} (HP: ${poke.hp})`;
      btn.addEventListener('click', () => switchPokemon(idx));
      container.appendChild(btn);
    }
  });

  switchModal.classList.remove('hidden');
}

function switchPokemon(index) {
  // 1) Save the outgoing Pokémon’s current HP back into its team slot
  const oldPoke = playerTeam[currentPokemonIndex];
  oldPoke.HP = playerPokemon.hp;

  // 2) Update index and grab new Pokémon
  currentPokemonIndex = index;
  const poke = playerTeam[index];

  // 3) Recompute stats
  playerPokemon.name     = poke.Name;
  playerPokemon.hp       = Math.max(0, poke.HP);  // now reads saved HP!
  playerPokemon.maxHp    = Math.max(120, Math.floor(poke.HPOriginal * 2.5 || poke.HP * 2.5));
  playerPokemon.attack   = Math.max(30,  Math.floor(poke.Attack * 1.2));
  playerPokemon.spAttack = Math.max(30,  Math.floor((poke.SpAttack || poke.Attack) * 1.2));
  playerPokemon.speed    = Math.max(25,  poke.Speed);
  playerPokemon.id       = poke.id;
  playerPokemon.num      = poke.Num;

  // 4) Update UI
  document.getElementById('player-pokemon-name').textContent = playerPokemon.name;
  document.getElementById('player-hp').textContent = `HP: ${playerPokemon.hp}/${playerPokemon.maxHp}`;
  document.getElementById('player-health-fill').style.width =
    (playerPokemon.hp / playerPokemon.maxHp * 100) + "%";
  document.getElementById('player-attack').textContent = `ATK: ${playerPokemon.attack}`;
  document.getElementById('player-spattack').textContent = `SP.ATK: ${playerPokemon.spAttack}`;
  document.getElementById('player-speed').textContent = `SPD: ${playerPokemon.speed}`;

  // 5) Update sprite
  const sprite = document.getElementById('player-pokemon-sprite');
  const backUrl  = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${playerPokemon.num}.png`;
  const frontUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerPokemon.num}.png`;
  sprite.src = backUrl;
  sprite.onerror = () => {
    sprite.src = frontUrl;
    sprite.style.transform = "scaleX(-1)";
  };

  // 6) Close modal
  switchModal.classList.add('hidden');
}


