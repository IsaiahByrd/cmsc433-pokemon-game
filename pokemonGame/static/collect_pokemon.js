// Collect Pokemon Battle System
let gameState = {
    userTeam: [],
    enemyTeam: [],
    currentUserPokemon: null,
    currentEnemyPokemon: null,
    userPokemonIndex: 0,
    enemyPokemonIndex: 0,
    battleInProgress: false
};

// Initialize the collect pokemon system
window.onload = function() {
    document.getElementById('startBattleBtn').addEventListener('click', startBattle);
    document.getElementById('attackBtn').addEventListener('click', attack);
    document.getElementById('specialAttackBtn').addEventListener('click', specialAttack);
    document.getElementById('collectBtn').addEventListener('click', collectPokemon);
    document.getElementById('switchBtn').addEventListener('click', showSwitchPanel);
    document.getElementById('cancelSwitchBtn').addEventListener('click', hideSwitchPanel);
};

function startBattle() {
    // Hide pre-battle screen and show battle screen
    document.getElementById('preBattleScreen').style.display = 'none';
    document.getElementById('battleScreen').style.display = 'block';
    
    // Load user team from the template data
    loadUserTeam();
    
    // Generate random enemy team
    generateEnemyTeam();
    
    // Start the first battle
    initializeBattle();
    
    addBattleLogEntry("Battle started! Face 3 wild Pokemon!");
}

function loadUserTeam() {
    // Get user team data from server
    fetch('/api/user_team')
        .then(response => response.json())
        .then(data => {
            gameState.userTeam = data.map(pokemon => ({
                ...pokemon,
                currentHP: pokemon.HP,
                maxHP: pokemon.HP
            }));
            gameState.currentUserPokemon = gameState.userTeam[0];
            gameState.userPokemonIndex = 0;
            updateUserDisplay();
        })
        .catch(error => {
            console.error('Error loading user team:', error);
            addBattleLogEntry("Error loading your team!");
        });
}

function generateEnemyTeam() {
    // Fetch 3 random Pokemon for the enemy team
    Promise.all([
        fetch('/api/random_pokemon').then(r => r.json()),
        fetch('/api/random_pokemon').then(r => r.json()),
        fetch('/api/random_pokemon').then(r => r.json())
    ])
    .then(enemyData => {
        gameState.enemyTeam = enemyData.map(pokemon => ({
            ...pokemon,
            currentHP: pokemon.HP,
            maxHP: pokemon.HP
        }));
        gameState.currentEnemyPokemon = gameState.enemyTeam[0];
        gameState.enemyPokemonIndex = 0;
        updateEnemyTeamDisplay();
        updateEnemyDisplay();
    })
    .catch(error => {
        console.error('Error generating enemy team:', error);
        addBattleLogEntry("Error generating enemy team!");
    });
}

function initializeBattle() {
    gameState.battleInProgress = true;
    updateBattleDisplay();
    addBattleLogEntry(`${gameState.currentUserPokemon.Name} vs ${gameState.currentEnemyPokemon.Name}!`);
}

function updateUserDisplay() {
    if (!gameState.currentUserPokemon) return;
    
    const pokemon = gameState.currentUserPokemon;
    document.getElementById('userName').textContent = pokemon.Name;
    document.getElementById('userHPText').textContent = `HP: ${pokemon.currentHP}/${pokemon.maxHP}`;
    document.getElementById('userSprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.Num}.png`;
    
    const hpBar = document.getElementById('userHPBar');
    const hpPercentage = (pokemon.currentHP / pokemon.maxHP) * 100;
    hpBar.style.width = hpPercentage + '%';
    
    // Change HP bar color based on health
    if (hpPercentage > 60) {
        hpBar.style.background = 'linear-gradient(90deg, #50C878, #90EE90)';
    } else if (hpPercentage > 25) {
        hpBar.style.background = 'linear-gradient(90deg, #FFD700, #FFA500)';
    } else {
        hpBar.style.background = 'linear-gradient(90deg, #FF6B35, #FF4444)';
    }
}

function updateEnemyDisplay() {
    if (!gameState.currentEnemyPokemon) return;
    
    const pokemon = gameState.currentEnemyPokemon;
    document.getElementById('enemyName').textContent = pokemon.Name;
    document.getElementById('enemyHPText').textContent = `HP: ${pokemon.currentHP}/${pokemon.maxHP}`;
    document.getElementById('enemySprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.Num}.png`;
    
    const hpBar = document.getElementById('enemyHPBar');
    const hpPercentage = (pokemon.currentHP / pokemon.maxHP) * 100;
    hpBar.style.width = hpPercentage + '%';
    
    // Change HP bar color based on health
    if (hpPercentage > 60) {
        hpBar.style.background = 'linear-gradient(90deg, #50C878, #90EE90)';
    } else if (hpPercentage > 25) {
        hpBar.style.background = 'linear-gradient(90deg, #FFD700, #FFA500)';
    } else {
        hpBar.style.background = 'linear-gradient(90deg, #FF6B35, #FF4444)';
    }
    
    // Update collect button state
    const collectBtn = document.getElementById('collectBtn');
    if (hpPercentage < 25) {
        collectBtn.disabled = false;
        collectBtn.textContent = 'Collect Pokemon';
        collectBtn.style.background = 'linear-gradient(45deg, #50C878, #48BB78)';
    } else {
        collectBtn.disabled = true;
        collectBtn.textContent = 'Weaken First';
        collectBtn.style.background = 'linear-gradient(45deg, #666, #555)';
    }
}

function updateEnemyTeamDisplay() {
    const enemyTeamDiv = document.getElementById('enemyTeam');
    enemyTeamDiv.innerHTML = '';
    
    gameState.enemyTeam.forEach((pokemon, index) => {
        const pokemonDiv = document.createElement('div');
        pokemonDiv.className = 'enemy-pokemon';
        if (pokemon.currentHP <= 0) pokemonDiv.classList.add('fainted');
        if (index === gameState.enemyPokemonIndex) pokemonDiv.style.border = '2px solid #FFD700';
        
        pokemonDiv.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.Num}.png" alt="${pokemon.Name}">
            <div style="font-size: 10px; color: #fff; margin-top: 5px;">${pokemon.Name}</div>
            <div style="font-size: 8px; color: #E2E8F0;">${pokemon.currentHP}/${pokemon.maxHP} HP</div>
        `;
        
        enemyTeamDiv.appendChild(pokemonDiv);
    });
}

function updateBattleDisplay() {
    updateUserDisplay();
    updateEnemyDisplay();
    updateEnemyTeamDisplay();
}

function attack() {
    if (!gameState.battleInProgress || !gameState.currentUserPokemon || !gameState.currentEnemyPokemon) return;
    
    const userPokemon = gameState.currentUserPokemon;
    const enemyPokemon = gameState.currentEnemyPokemon;
    
    if (userPokemon.currentHP <= 0) {
        addBattleLogEntry("Your Pokemon has fainted! Switch to another Pokemon.");
        return;
    }
    
    // Determine turn order
    const userGoesFirst = userPokemon.Speed >= enemyPokemon.Speed;
    
    if (userGoesFirst) {
        performUserAttack('normal');
        if (enemyPokemon.currentHP > 0) {
            setTimeout(() => performEnemyAttack(), 1000);
        }
    } else {
        performEnemyAttack();
        if (userPokemon.currentHP > 0) {
            setTimeout(() => performUserAttack('normal'), 1000);
        }
    }
}

function specialAttack() {
    if (!gameState.battleInProgress || !gameState.currentUserPokemon || !gameState.currentEnemyPokemon) return;
    
    const userPokemon = gameState.currentUserPokemon;
    const enemyPokemon = gameState.currentEnemyPokemon;
    
    if (userPokemon.currentHP <= 0) {
        addBattleLogEntry("Your Pokemon has fainted! Switch to another Pokemon.");
        return;
    }
    
    performUserAttack('special');
    if (enemyPokemon.currentHP > 0) {
        setTimeout(() => performEnemyAttack(), 1000);
    }
}

function performUserAttack(type) {
    const userPokemon = gameState.currentUserPokemon;
    const enemyPokemon = gameState.currentEnemyPokemon;
    
    const baseDamage = type === 'special' ? userPokemon['Sp. Atk'] || userPokemon.Attack : userPokemon.Attack;
    const damage = Math.max(1, baseDamage - Math.floor(Math.random() * 5));
    
    enemyPokemon.currentHP = Math.max(0, enemyPokemon.currentHP - damage);
    
    const attackType = type === 'special' ? 'Special Attack' : 'Attack';
    addBattleLogEntry(`${userPokemon.Name} uses ${attackType} for ${damage} damage!`);
    
    updateEnemyDisplay();
    updateEnemyTeamDisplay();
    
    if (enemyPokemon.currentHP <= 0) {
        addBattleLogEntry(`${enemyPokemon.Name} fainted!`);
        handleEnemyFaint();
    }
}

function performEnemyAttack() {
    const userPokemon = gameState.currentUserPokemon;
    const enemyPokemon = gameState.currentEnemyPokemon;
    
    if (enemyPokemon.currentHP <= 0) return;
    
    const damage = Math.max(1, enemyPokemon.Attack - Math.floor(Math.random() * 3));
    userPokemon.currentHP = Math.max(0, userPokemon.currentHP - damage);
    
    addBattleLogEntry(`${enemyPokemon.Name} attacks for ${damage} damage!`);
    
    updateUserDisplay();
    
    if (userPokemon.currentHP <= 0) {
        addBattleLogEntry(`${userPokemon.Name} fainted!`);
        handleUserFaint();
    }
}

function handleEnemyFaint() {
    // Move to next enemy Pokemon
    gameState.enemyPokemonIndex++;
    
    if (gameState.enemyPokemonIndex >= gameState.enemyTeam.length) {
        // All enemies defeated
        addBattleLogEntry("You defeated all wild Pokemon! Battle complete!");
        endBattle();
        return;
    }
    
    gameState.currentEnemyPokemon = gameState.enemyTeam[gameState.enemyPokemonIndex];
    addBattleLogEntry(`A wild ${gameState.currentEnemyPokemon.Name} appears!`);
    updateBattleDisplay();
}

function handleUserFaint() {
    // Check if user has any Pokemon left
    const alivePokemon = gameState.userTeam.filter(p => p.currentHP > 0);
    
    if (alivePokemon.length === 0) {
        addBattleLogEntry("All your Pokemon have fainted! Battle over!");
        endBattle();
        return;
    }
    
    // Auto-switch to next alive Pokemon or show switch panel
    showSwitchPanel();
}

function collectPokemon() {
    const enemyPokemon = gameState.currentEnemyPokemon;
    const hpRatio = enemyPokemon.currentHP / enemyPokemon.maxHP;
    
    if (hpRatio >= 0.25) {
        addBattleLogEntry("Pokemon is too strong to collect! Reduce HP below 25%!");
        return;
    }
    
    // Attempt to collect the Pokemon
    fetch(`/catch/${enemyPokemon.id}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addBattleLogEntry(`Success! You collected ${enemyPokemon.Name}!`);
            // Remove this enemy and continue
            gameState.enemyTeam.splice(gameState.enemyPokemonIndex, 1);
            
            if (gameState.enemyTeam.length === 0) {
                addBattleLogEntry("You collected all wild Pokemon! Battle complete!");
                endBattle();
                return;
            }
            
            // Adjust index if necessary
            if (gameState.enemyPokemonIndex >= gameState.enemyTeam.length) {
                gameState.enemyPokemonIndex = gameState.enemyTeam.length - 1;
            }
            
            gameState.currentEnemyPokemon = gameState.enemyTeam[gameState.enemyPokemonIndex];
            addBattleLogEntry(`A wild ${gameState.currentEnemyPokemon.Name} appears!`);
            updateBattleDisplay();
        } else {
            addBattleLogEntry(`Failed to collect ${enemyPokemon.Name}. Try again!`);
        }
    })
    .catch(error => {
        console.error('Error collecting Pokemon:', error);
        addBattleLogEntry("Error occurred while collecting Pokemon!");
    });
}

function showSwitchPanel() {
    const switchPanel = document.getElementById('switchPanel');
    const switchOptions = document.getElementById('switchOptions');
    
    switchOptions.innerHTML = '';
    
    gameState.userTeam.forEach((pokemon, index) => {
        if (pokemon.currentHP > 0 && index !== gameState.userPokemonIndex) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'switch-option';
            optionDiv.onclick = () => switchPokemon(index);
            
            optionDiv.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.Num}.png" alt="${pokemon.Name}">
                <div class="pokemon-name">${pokemon.Name}</div>
                <div style="font-size: 10px; color: #E2E8F0;">${pokemon.currentHP}/${pokemon.maxHP} HP</div>
            `;
            
            switchOptions.appendChild(optionDiv);
        }
    });
    
    switchPanel.style.display = 'block';
}

function hideSwitchPanel() {
    document.getElementById('switchPanel').style.display = 'none';
}

function switchPokemon(index) {
    gameState.userPokemonIndex = index;
    gameState.currentUserPokemon = gameState.userTeam[index];
    
    addBattleLogEntry(`Go, ${gameState.currentUserPokemon.Name}!`);
    
    updateUserDisplay();
    hideSwitchPanel();
    
    // Enemy gets a free attack when switching
    setTimeout(() => performEnemyAttack(), 500);
}

function endBattle() {
    gameState.battleInProgress = false;
    
    // Show end battle options
    const battleActions = document.getElementById('battleActions');
    battleActions.innerHTML = `
        <button class="battle-button" onclick="window.location.href='/menu'">Return to Menu</button>
        <button class="battle-button" onclick="window.location.reload()">Battle Again</button>
    `;
    
    addBattleLogEntry("Battle ended! Check your collection for new Pokemon.");
}

function addBattleLogEntry(message) {
    const logContent = document.getElementById('logContent');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    
    // Keep only last 20 entries
    while (logContent.children.length > 20) {
        logContent.removeChild(logContent.firstChild);
    }
}
