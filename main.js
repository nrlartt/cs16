// ========== MAIN CONTROLLER ==========
let game = null;
let playfunSDK = null;

// Initialize Play.fun SDK
try {
    playfunSDK = new OpenGameSDK({
        gameId: '5b221ece-b46a-4acd-b2ca-85b5ec22f0c1',
        ui: { usePointsWidget: true },
    });
    playfunSDK.init().then(() => {
        console.log('Play.fun SDK ready!');
    }).catch(err => {
        console.warn('Play.fun SDK init failed:', err);
    });
} catch (e) {
    console.warn('Play.fun SDK not available:', e);
}

// Initialize pixel sprites on load
window.addEventListener('DOMContentLoaded', () => {
    PixelSprites.init();
    // Draw team previews after small delay for fonts
    setTimeout(() => {
        PixelSprites.drawPreview('ct-preview', 'ct');
        PixelSprites.drawPreview('t-preview', 't');
    }, 100);
});

function showMainMenu() {
    hideAllScreens();
    document.getElementById('main-menu').classList.add('active');
    setTimeout(() => {
        PixelSprites.drawPreview('ct-preview', 'ct');
        PixelSprites.drawPreview('t-preview', 't');
    }, 50);
}

function showTeamSelect() {
    hideAllScreens();
    document.getElementById('team-select').classList.add('active');
    setTimeout(() => {
        PixelSprites.drawPreview('ct-preview', 'ct');
        PixelSprites.drawPreview('t-preview', 't');
    }, 50);
}

function showSettings() {
    hideAllScreens();
    document.getElementById('settings-screen').classList.add('active');
}

function showControls() {
    hideAllScreens();
    document.getElementById('controls-screen').classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

let lastTeam = 'ct';

function selectTeam(team) {
    lastTeam = team;
    hideAllScreens();
    document.getElementById('game-screen').classList.add('active');
    AudioEngine.init();
    if (game) game.stop();
    game = new Game();
    game.crosshairColor = document.querySelector('.color-btn.active')?.dataset.color || '#00ff00';
    game.sensitivity = parseInt(document.getElementById('sensitivity-slider').value) / 10;
    game.difficulty = document.getElementById('difficulty-select').value;
    AudioEngine.setVolume(parseInt(document.getElementById('volume-slider').value) / 100);
    game.init(team);
}

function closeBuyMenu() {
    if (game) { game.buyMenuOpen = false; document.getElementById('buy-menu').style.display = 'none'; }
}

function restartGame() {
    // Save score to Play.fun before restart
    if (playfunSDK && game) {
        try { playfunSDK.savePoints(); } catch (e) { }
    }
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('round-end-overlay').style.display = 'none';
    document.getElementById('score-value').textContent = '0';
    if (game) game.stop();
    selectTeam(lastTeam);
}

function backToMenu() {
    // Save score to Play.fun before leaving
    if (playfunSDK && game) {
        try { playfunSDK.savePoints(); } catch (e) { }
    }
    if (game) game.stop();
    game = null;
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('round-end-overlay').style.display = 'none';
    document.getElementById('score-value').textContent = '0';
    showMainMenu();
}

// Sync points to Play.fun when scoring in-game
function syncPlayfunScore(points) {
    if (playfunSDK) {
        try { playfunSDK.addPoints(points); } catch (e) { }
    }
}

// Auto-save points every 30 seconds
setInterval(() => {
    if (playfunSDK && game && game.running) {
        try { playfunSDK.savePoints(); } catch (e) { }
    }
}, 30000);

// Save on page unload
window.addEventListener('beforeunload', () => {
    if (playfunSDK) {
        try { playfunSDK.savePoints(); } catch (e) { }
    }
});

function setCrosshairColor(btn) {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (game) game.crosshairColor = btn.dataset.color;
}

document.getElementById('volume-slider').addEventListener('input', function () {
    document.getElementById('volume-val').textContent = this.value + '%';
    AudioEngine.setVolume(parseInt(this.value) / 100);
});
document.getElementById('sensitivity-slider').addEventListener('input', function () {
    document.getElementById('sens-val').textContent = this.value;
    if (game) game.sensitivity = parseInt(this.value) / 10;
});

document.addEventListener('contextmenu', e => e.preventDefault());
