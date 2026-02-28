// ========== MAIN CONTROLLER ==========
let game = null;

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
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('round-end-overlay').style.display = 'none';
    document.getElementById('score-value').textContent = '0';
    if (game) game.stop();
    selectTeam(lastTeam);
}

function backToMenu() {
    if (game) game.stop();
    game = null;
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('round-end-overlay').style.display = 'none';
    document.getElementById('score-value').textContent = '0';
    showMainMenu();
}

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
