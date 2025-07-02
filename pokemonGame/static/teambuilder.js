// Team Builder JavaScript
// Global variables will be initialized by the HTML template
let currentTeam = [];
let teamCount = 0;

// Initialize function to be called from HTML
function initializeTeamBuilder(currentTeamIds) {
    currentTeam = currentTeamIds;
    teamCount = currentTeam.length;
    updateSaveButton();
}

function addToTeam(pokemonId, cardElement) {
    if (teamCount >= 3) {
        showMessage('Your team is already full! Remove a Pokemon first.', 'warning');
        return;
    }

    // Find next empty slot
    let slot = null;
    for (let i = 0; i < 3; i++) {
        const slotElement = document.getElementById(`slot-${i}`);
        if (!slotElement.classList.contains('filled')) {
            slot = slotElement;
            break;
        }
    }

    if (!slot) {
        showMessage('No empty slots available!', 'error');
        return;
    }

    // Add to team array
    currentTeam.push(pokemonId);
    teamCount++;

    // Hide the card from collection with animation
    cardElement.style.transform = 'scale(0.8)';
    cardElement.style.opacity = '0.5';
    setTimeout(() => {
        cardElement.style.display = 'none';
        cardElement.style.transform = 'scale(1)';
        cardElement.style.opacity = '1';
    }, 300);

    // Update the slot
    const pokemonData = getPokemonDataFromCard(cardElement);
    updateSlot(slot, pokemonData, pokemonId);

    // Update save button
    updateSaveButton();
    
    showMessage(`${pokemonData.name} added to your team!`, 'success');
}

function removeFromTeam(position) {
    const slot = document.getElementById(`slot-${position}`);
    const pokemonId = slot.dataset.pokemonId;
    
    if (!pokemonId) return;

    // Get Pokemon name for message
    const pokemonName = slot.querySelector('.pokemon-name').textContent;

    // Remove from team array
    const index = currentTeam.indexOf(parseInt(pokemonId));
    if (index > -1) {
        currentTeam.splice(index, 1);
        teamCount--;
    }

    // Show the card back in collection with animation
    const card = document.querySelector(`[data-pokemon-id="${pokemonId}"]`);
    if (card) {
        card.style.display = 'block';
        card.style.transform = 'scale(1.1)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 200);
    }

    // Clear the slot with animation
    slot.style.transform = 'scale(0.9)';
    setTimeout(() => {
        clearSlot(slot);
        slot.style.transform = 'scale(1)';
    }, 200);

    // Update save button
    updateSaveButton();
    
    showMessage(`${pokemonName} removed from your team!`, 'info');
}

function getPokemonDataFromCard(cardElement) {
    return {
        name: cardElement.querySelector('.pokemon-name').textContent,
        sprite: cardElement.querySelector('.pokemon-sprite').src,
        types: cardElement.querySelector('.pokemon-types').innerHTML,
        stats: cardElement.querySelector('.pokemon-stats').textContent
    };
}

function updateSlot(slot, pokemonData, pokemonId) {
    slot.classList.add('filled');
    slot.dataset.pokemonId = pokemonId;
    slot.innerHTML = `
        <button class="remove-btn" onclick="removeFromTeam(${slot.dataset.position})">&times;</button>
        <img src="${pokemonData.sprite}" alt="${pokemonData.name}" class="pokemon-sprite">
        <div class="pokemon-name">${pokemonData.name}</div>
        <div class="pokemon-types">${pokemonData.types}</div>
        <div class="pokemon-stats">${pokemonData.stats}</div>
    `;
}

function clearSlot(slot) {
    slot.classList.remove('filled');
    delete slot.dataset.pokemonId;
    const position = slot.dataset.position;
    slot.innerHTML = `
        <div class="empty-slot">
            <p>Empty Slot ${parseInt(position) + 1}</p>
            <p>Click a Pokemon to add</p>
        </div>
    `;
}

function updateSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (teamCount === 3) {
        saveBtn.disabled = false;
    } else {
        saveBtn.disabled = true;
    }
}

function saveTeam() {
    if (currentTeam.length !== 3) {
        showMessage('You need exactly 3 Pokemon to save your team!', 'warning');
        return;
    }

    // Show loading state
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    fetch('/save_team', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pokemon_ids: currentTeam
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message || 'Team saved successfully!', 'success');
        } else {
            showMessage(data.error || 'Failed to save team', 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred while saving your team', 'error');
        console.error('Error:', error);
    })
    .finally(() => {
        // Reset button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    });
}

function clearTeam() {
    if (confirm('Are you sure you want to clear your entire team?')) {
        // Show all cards back in collection with staggered animation
        currentTeam.forEach((pokemonId, index) => {
            const card = document.querySelector(`[data-pokemon-id="${pokemonId}"]`);
            if (card) {
                setTimeout(() => {
                    card.style.display = 'block';
                    card.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        card.style.transform = 'scale(1)';
                    }, 200);
                }, index * 100);
            }
        });

        // Clear all slots with staggered animation
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`slot-${i}`);
            setTimeout(() => {
                slot.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    clearSlot(slot);
                    slot.style.transform = 'scale(1)';
                }, 200);
            }, i * 150);
        }

        // Reset variables
        currentTeam = [];
        teamCount = 0;

        // Update save button
        updateSaveButton();
        
        showMessage('Team cleared!', 'info');
    }
}

// Message system for better user feedback
function showMessage(text, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.team-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `team-message team-message-${type}`;
    messageDiv.textContent = text;
    
    // Style the message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Press Start 2P', monospace;
        font-size: 11px;
        color: white;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        max-width: 300px;
        line-height: 1.4;
    `;
    
    // Set color based on type
    switch (type) {
        case 'success':
            messageDiv.style.background = 'linear-gradient(45deg, #50C878, #48BB78)';
            messageDiv.style.boxShadow = '0 4px 15px rgba(80, 200, 120, 0.4)';
            break;
        case 'error':
            messageDiv.style.background = 'linear-gradient(45deg, #FF6B35, #F7931E)';
            messageDiv.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.4)';
            break;
        case 'warning':
            messageDiv.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
            messageDiv.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
            messageDiv.style.color = '#000';
            break;
        default:
            messageDiv.style.background = 'linear-gradient(45deg, #5A67D8, #4C51BF)';
            messageDiv.style.boxShadow = '0 4px 15px rgba(90, 103, 216, 0.4)';
    }
    
    document.body.appendChild(messageDiv);
    
    // Animate in
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}
