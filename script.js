/**
 * Casino Blackjack - Main JavaScript
 * Handles game logic, user registration, betting, and leaderboard functionality
 */

// Global variables
let deck = [];
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let playerBalance = 1000; // Starting balance
let currentBet = 0;
let gameInProgress = false;
let currentUser = null;
let gameSettings = {
    soundVolume: 50,
    musicVolume: 30,
    enableAnimations: true,
    enableSoundEffects: true,
    enableMusic: true,
    graphicsQuality: 'medium'
};

// Cache DOM elements
const mainMenu = document.getElementById('mainMenu');
const playBtn = document.getElementById('playBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const settingsBtn = document.getElementById('settingsBtn');
const menuBtn = document.getElementById('menuBtn');
const settingsNavBtn = document.getElementById('settingsNavBtn');
const leaderboardNavBtn = document.getElementById('leaderboardNavBtn');
const gameStatus = document.getElementById('gameStatus');
const balanceAmount = document.getElementById('balanceAmount');
const dealerHandEl = document.getElementById('dealerHand');
const playerHandEl = document.getElementById('playerHand');
const dealerValueEl = document.getElementById('dealerValue');
const playerValueEl = document.getElementById('playerValue');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const dealBtn = document.getElementById('dealBtn');
const doubleBtn = document.getElementById('doubleBtn');
const betAmountEl = document.getElementById('betAmount');
const currentBetEl = document.getElementById('currentBet');
const chips = document.querySelectorAll('.chip');
const settingsPanel = document.getElementById('settingsPanel');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const resultAmount = document.getElementById('resultAmount');
const continueBtn = document.getElementById('continueBtn');
const overlay = document.getElementById('overlay');
const leaderboardBody = document.getElementById('leaderboardBody');

// Initialize the game
document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    setupEventListeners();
    loadSettings();
    checkForExistingUser();
    mainMenu.style.display = 'flex';
    document.querySelector('.game-container').style.display = 'none';
    settingsPanel.style.display = 'none';
    leaderboardPanel.style.display = 'none';
    resultModal.style.display = 'none';
    overlay.style.display = 'none';
}

// Check for existing user in local storage
function checkForExistingUser() {
    const savedUser = localStorage.getItem('blackjackUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        playerBalance = currentUser.balance;
        updateBalanceDisplay();
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Main menu buttons
    playBtn.addEventListener('click', startGame);
    leaderboardBtn.addEventListener('click', showLeaderboard);
    settingsBtn.addEventListener('click', showSettings);
    
    // Navigation buttons
    menuBtn.addEventListener('click', showMainMenu);
    settingsNavBtn.addEventListener('click', showSettings);
    leaderboardNavBtn.addEventListener('click', showLeaderboard);
    
    // Game control buttons
    hitBtn.addEventListener('click', playerHit);
    standBtn.addEventListener('click', playerStand);
    dealBtn.addEventListener('click', dealCards);
    doubleBtn.addEventListener('click', playerDouble);
    
    // Betting chips
    chips.forEach(chip => {
        chip.addEventListener('click', () => addBet(parseInt(chip.dataset.value)));
    });
    
    // Settings panel
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('cancelSettings').addEventListener('click', hideSettings);
    
    // Leaderboard
    document.getElementById('closeLeaderboard').addEventListener('click', hideLeaderboard);
    
    // Result modal
    continueBtn.addEventListener('click', continueGame);
}

// User Registration Functions
function showRegistrationForm() {
    overlay.style.display = 'block';
    
    // Create registration form
    const registrationForm = document.createElement('div');
    registrationForm.className = 'registration-form';
    registrationForm.innerHTML = `
        <h2>PLAYER REGISTRATION</h2>
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" placeholder="Enter a username" required>
        </div>
        <div class="form-buttons">
            <button id="registerBtn">REGISTER</button>
            <button id="guestBtn">PLAY AS GUEST</button>
        </div>
    `;
    
    document.body.appendChild(registrationForm);
    
    // Registration buttons
    document.getElementById('registerBtn').addEventListener('click', registerUser);
    document.getElementById('guestBtn').addEventListener('click', () => {
        document.body.removeChild(registrationForm);
        overlay.style.display = 'none';
        startGameAfterRegistration();
    });
}

function registerUser() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showNotification('Please enter a username', 'error');
        return;
    }
    
    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem('blackjackUsers') || '[]');
    if (existingUsers.some(user => user.username === username)) {
        showNotification('Username already taken', 'error');
        return;
    }
    
    // Create new user
    currentUser = {
        username: username,
        balance: 1000,
        gamesPlayed: 0,
        totalWinnings: 0,
        highestWin: 0,
        registrationDate: new Date().toISOString()
    };
    
    // Save user to local storage
    existingUsers.push(currentUser);
    localStorage.setItem('blackjackUsers', JSON.stringify(existingUsers));
    localStorage.setItem('blackjackUser', JSON.stringify(currentUser));
    
    // Remove registration form
    document.body.removeChild(document.querySelector('.registration-form'));
    overlay.style.display = 'none';
    
    showNotification(`Welcome, ${username}!`, 'success');
    startGameAfterRegistration();
}

// Game UI Functions
function startGame() {
    if (!currentUser) {
        showRegistrationForm();
    } else {
        startGameAfterRegistration();
    }
}

function startGameAfterRegistration() {
    mainMenu.style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
    resetGame();
    updateBalanceDisplay();
    
    // Apply animation class to the game table for entrance effect
    const gameTable = document.querySelector('.game-table');
    gameTable.classList.add('fade-in');
    setTimeout(() => gameTable.classList.remove('fade-in'), 1000);
    
    gameStatus.textContent = 'Place your bet to start';
    gameStatus.classList.add('status-highlight');
    
    // Show chips with animation
    const chipsContainer = document.querySelector('.chips-container');
    chipsContainer.classList.add('slide-up');
}

function showMainMenu() {
    if (gameInProgress) {
        if (confirm('Are you sure you want to quit the current game?')) {
            resetGame();
            document.querySelector('.game-container').style.display = 'none';
            mainMenu.style.display = 'flex';
        }
    } else {
        document.querySelector('.game-container').style.display = 'none';
        mainMenu.style.display = 'flex';
    }
}

function showSettings() {
    // Update settings inputs with current values
    document.getElementById('soundVolume').value = gameSettings.soundVolume;
    document.getElementById('musicVolume').value = gameSettings.musicVolume;
    document.getElementById('enableAnimations').checked = gameSettings.enableAnimations;
    document.getElementById('enableSoundEffects').checked = gameSettings.enableSoundEffects;
    document.getElementById('enableMusic').checked = gameSettings.enableMusic;
    document.getElementById('graphicsQuality').value = gameSettings.graphicsQuality;
    
    settingsPanel.style.display = 'block';
    overlay.style.display = 'block';
    
    // Add entrance animation
    settingsPanel.classList.add('panel-slide-in');
    setTimeout(() => settingsPanel.classList.remove('panel-slide-in'), 500);
}

function hideSettings() {
    settingsPanel.classList.add('panel-slide-out');
    setTimeout(() => {
        settingsPanel.style.display = 'none';
        settingsPanel.classList.remove('panel-slide-out');
    }, 300);
    overlay.style.display = 'none';
}

function saveSettings() {
    gameSettings.soundVolume = parseInt(document.getElementById('soundVolume').value);
    gameSettings.musicVolume = parseInt(document.getElementById('musicVolume').value);
    gameSettings.enableAnimations = document.getElementById('enableAnimations').checked;
    gameSettings.enableSoundEffects = document.getElementById('enableSoundEffects').checked;
    gameSettings.enableMusic = document.getElementById('enableMusic').checked;
    gameSettings.graphicsQuality = document.getElementById('graphicsQuality').value;
    
    // Save settings to local storage
    localStorage.setItem('blackjackSettings', JSON.stringify(gameSettings));
    
    // Apply settings immediately
    applySettings();
    
    showNotification('Settings saved', 'success');
    hideSettings();
}

function loadSettings() {
    const savedSettings = localStorage.getItem('blackjackSettings');
    if (savedSettings) {
        gameSettings = JSON.parse(savedSettings);
    }
    applySettings();
}

function applySettings() {
    // Apply visual settings based on graphics quality
    document.body.className = `quality-${gameSettings.graphicsQuality}`;
    
    // Apply animation settings
    if (!gameSettings.enableAnimations) {
        document.documentElement.style.setProperty('--card-animation-duration', '0s');
        document.documentElement.style.setProperty('--transition-duration', '0s');
    } else {
        document.documentElement.style.setProperty('--card-animation-duration', '0.5s');
        document.documentElement.style.setProperty('--transition-duration', '0.3s');
    }
    
    // Apply sound settings (will implement sound system in the second half)
}

// Leaderboard Functions
function showLeaderboard() {
    updateLeaderboard();
    leaderboardPanel.style.display = 'block';
    overlay.style.display = 'block';
    
    // Add entrance animation
    leaderboardPanel.classList.add('panel-slide-in');
    setTimeout(() => leaderboardPanel.classList.remove('panel-slide-in'), 500);
}

function hideLeaderboard() {
    leaderboardPanel.classList.add('panel-slide-out');
    setTimeout(() => {
        leaderboardPanel.style.display = 'none';
        leaderboardPanel.classList.remove('panel-slide-out');
    }, 300);
    overlay.style.display = 'none';
}

function updateLeaderboard() {
    const users = JSON.parse(localStorage.getItem('blackjackUsers') || '[]');
    
    // Sort users by total winnings
    const sortedUsers = users.sort((a, b) => b.totalWinnings - a.totalWinnings);
    
    // Clear current leaderboard
    leaderboardBody.innerHTML = '';
    
    // Add users to leaderboard
    sortedUsers.slice(0, 10).forEach((user, index) => {
        const row = document.createElement('tr');
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        
        row.innerHTML = `
            <td class="leaderboard-rank ${rankClass}">${index + 1}</td>
            <td>${user.username}</td>
            <td>$${user.totalWinnings.toLocaleString()}</td>
            <td>${user.gamesPlayed}</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
    
    // If no users, show message
    if (sortedUsers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="no-data">No players yet. Be the first!</td>
        `;
        leaderboardBody.appendChild(row);
    }
}

// Game Logic Functions
function resetGame() {
    deck = [];
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;
    currentBet = 0;
    gameInProgress = false;
    
    // Reset UI
    dealerHandEl.innerHTML = '';
    playerHandEl.innerHTML = '';
    dealerValueEl.textContent = '';
    playerValueEl.textContent = '';
    betAmountEl.textContent = '0';
    currentBetEl.innerHTML = '';
    
    // Reset buttons
    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = true;
    doubleBtn.disabled = true;
    
    // Enable chips for betting
    chips.forEach(chip => chip.classList.remove('disabled'));
}

function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    deck = [];
    
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    
    // Shuffle the deck
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Betting Functions
function addBet(amount) {
    if (gameInProgress) return;
    
    if (amount > playerBalance) {
        showNotification('Not enough funds', 'error');
        return;
    }
    
    currentBet += amount;
    playerBalance -= amount;
    
    updateBetDisplay();
    updateBalanceDisplay();
    
    // Create a chip element
    const chipEl = document.createElement('div');
    chipEl.className = `bet-chip chip-${amount}`;
    chipEl.textContent = `$${amount}`;
    currentBetEl.appendChild(chipEl);
    
    // Apply animation if enabled
    if (gameSettings.enableAnimations) {
        chipEl.classList.add('chip-added');
        setTimeout(() => chipEl.classList.remove('chip-added'), 300);
    }
    
    // Enable deal button if bet is placed
    if (currentBet > 0) {
        dealBtn.disabled = false;
        gameStatus.textContent = 'Press DEAL to start the game';
    }
}

function updateBetDisplay() {
    betAmountEl.textContent = currentBet;
}

function updateBalanceDisplay() {
    balanceAmount.textContent = `$${playerBalance}`;
    
    // Animate balance change
    balanceAmount.classList.add('balance-update');
    setTimeout(() => balanceAmount.classList.remove('balance-update'), 500);
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}