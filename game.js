// ========== GAME ENGINE ==========

// Agent callsign names
const CT_AGENTS = ['Phoenix', 'Viper', 'Hawk', 'Cobra', 'Ghost', 'Frost', 'Blaze', 'Steel', 'Ace', 'Nova'];
const T_AGENTS = ['Shadow', 'Blade', 'Reaper', 'Wolf', 'Raven', 'Striker', 'Venom', 'Spectre', 'Jackal', 'Fury'];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.radarCanvas = document.getElementById('radarCanvas');
        this.radarCtx = this.radarCanvas.getContext('2d');
        this.map = new GameMap();
        this.players = []; this.bullets = []; this.particles = []; this.decals = [];
        this.killFeed = []; this.muzzleFlashes = [];
        this.camera = { x: 0, y: 0, viewWidth: 0, viewHeight: 0 };
        this.shake = { x: 0, y: 0, intensity: 0 };
        this.keys = {}; this.mouse = { x: 0, y: 0, down: false };
        this.running = false; this.lastTime = 0;
        this.playerTeam = 'ct'; this.ctScore = 0; this.tScore = 0;
        this.round = 1; this.maxRounds = 15;
        this.roundTime = 105; this.roundTimer = this.roundTime;
        this.freezeTime = 5; this.freezeTimer = this.freezeTime;
        this.roundPhase = 'freeze';
        this.bombPlanted = false; this.bombTimer = 40; this.bombPos = null;
        this.bombDefusing = false; this.defuseTimer = 0; this.defuseTime = 10;
        this.crosshairColor = '#00ff00'; this.sensitivity = 1; this.difficulty = 'normal';
        this.buyMenuOpen = false; this.scoreboardOpen = false;
        this.stepTimer = 0; this.reloading = false; this.roundEndTimer = 0;
        this.gameOver = false;
        this.playerStats = { kills: 0, deaths: 0, money: 800 };
        this.bombTickTimer = 0;
        // Score system
        this.score = 0;
        this.scorePopups = []; // { x, y, text, color, time }
        this.survivalTime = 0;
    }

    init(team) {
        this.playerTeam = team;
        this.ctScore = 0; this.tScore = 0; this.round = 1;
        this.gameOver = false;
        this.score = 0; this.survivalTime = 0; this.scorePopups = [];
        this.playerStats = { kills: 0, deaths: 0, money: 800 };
        this.resize(); this.setupInput(); this.startRound();
        this.running = true; this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.viewWidth = this.canvas.width;
        this.camera.viewHeight = this.canvas.height;
    }

    setupInput() {
        this._onKeyDown = e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'Tab') { e.preventDefault(); this.scoreboardOpen = true; this.updateScoreboard(); }
            if (e.key.toLowerCase() === 'b') this.toggleBuyMenu();
            if (e.key.toLowerCase() === 'r') this.startReload();
            if (e.key.toLowerCase() === 'e') this.interactAction();
            if (e.key >= '1' && e.key <= '5') this.switchWeaponSlot(parseInt(e.key));
        };
        this._onKeyUp = e => { this.keys[e.key.toLowerCase()] = false; if (e.key === 'Tab') this.scoreboardOpen = false; };
        this._onMouseMove = e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; };
        this._onMouseDown = e => { if (e.button === 0) { this.mouse.down = true; AudioEngine.init(); } };
        this._onMouseUp = e => { if (e.button === 0) this.mouse.down = false; };
        this._onCtx = e => e.preventDefault();
        this._onResize = () => this.resize();
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('mousedown', this._onMouseDown);
        this.canvas.addEventListener('mouseup', this._onMouseUp);
        this.canvas.addEventListener('contextmenu', this._onCtx);
        window.addEventListener('resize', this._onResize);
    }

    createPlayer(id, team, isPlayer = false) {
        const sp = SPAWN_POINTS[team][id % SPAWN_POINTS[team].length];
        const dp = getDefaultPistol(team);
        return {
            id, team, isPlayer, x: sp.x, y: sp.y, angle: team === 'ct' ? Math.PI : 0,
            vx: 0, vy: 0, radius: 14, health: isPlayer ? 250 : 120, maxHealth: isPlayer ? 250 : 120, armor: 0, hasHelmet: false,
            alive: true, weapons: ['knife', dp], currentWeapon: 1,
            ammo: { [dp]: WEAPONS[dp].magSize }, reserveAmmo: { [dp]: WEAPONS[dp].reserveAmmo },
            money: isPlayer ? this.playerStats.money : 800,
            kills: isPlayer ? this.playerStats.kills : 0,
            deaths: isPlayer ? this.playerStats.deaths : 0,
            name: isPlayer ? 'Agent' : (team === 'ct' ? CT_AGENTS[id % CT_AGENTS.length] : T_AGENTS[id % T_AGENTS.length]),
            lastShot: 0, reloading: false, reloadEnd: 0,
            moving: false, walking: false, hasDefuseKit: team === 'ct',
            hasBomb: false, recoilOffset: 0, animFrame: 0, animTimer: 0,
            targetWaypoint: this.findNearestWaypoint(sp.x, sp.y), aiTimer: 0, aiState: 'patrol', aiTarget: null,
            stuckTimer: 0, lastX: sp.x, lastY: sp.y, lastDamageTime: 0
        };
    }

    startRound() {
        this.players = []; this.bullets = []; this.particles = []; this.decals = [];
        this.muzzleFlashes = [];
        this.bombPlanted = false; this.bombPos = null; this.bombDefusing = false;
        this.defuseTimer = 0; this.roundPhase = 'freeze';
        this.freezeTimer = this.freezeTime; this.roundTimer = this.roundTime;
        this.reloading = false; this.roundEndTimer = 0;

        const player = this.createPlayer(0, this.playerTeam, true);
        player.money = this.playerStats.money;
        player.kills = this.playerStats.kills;
        player.deaths = this.playerStats.deaths;
        this.players.push(player);

        for (let i = 1; i < 5; i++) {
            const bot = this.createPlayer(i, this.playerTeam);
            this.botBuyWeapons(bot); this.players.push(bot);
        }
        const enemyTeam = this.playerTeam === 'ct' ? 't' : 'ct';
        for (let i = 0; i < 5; i++) {
            const bot = this.createPlayer(5 + i, enemyTeam);
            this.botBuyWeapons(bot);
            if (enemyTeam === 't' && i === 0) bot.hasBomb = true;
            this.players.push(bot);
        }
        if (this.playerTeam === 't') player.hasBomb = true;

        this.showCenterMessage(`ROUND ${this.round}`, 2000);
        AudioEngine.play('round_start');
        this.updateHUD();
    }

    botBuyWeapons(bot) {
        const available = getAvailableWeapons(bot.team);
        const rifles = Object.entries(available).filter(([k, w]) => w.type === 'rifle' && w.price <= bot.money);
        if (rifles.length > 0 && bot.money >= 2000) {
            const [id, wep] = rifles[Math.floor(Math.random() * rifles.length)];
            bot.weapons.push(id); bot.currentWeapon = bot.weapons.length - 1;
            bot.ammo[id] = wep.magSize; bot.reserveAmmo[id] = wep.reserveAmmo;
            bot.money -= wep.price;
        }
        if (bot.money >= 1000) { bot.armor = 100; bot.hasHelmet = true; bot.money -= 1000; }
    }

    getWep(p) { return WEAPONS[p.weapons[p.currentWeapon]]; }
    getWepId(p) { return p.weapons[p.currentWeapon]; }
    getPlayer() { return this.players.find(p => p.isPlayer); }

    loop(ts) {
        if (!this.running) return;
        const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
        this.lastTime = ts;
        this.update(dt); this.render();
        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        if (this.gameOver) return;

        // Screen shake decay
        this.shake.intensity *= 0.9;
        this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
        this.shake.y = (Math.random() - 0.5) * this.shake.intensity;

        if (this.roundPhase === 'end') {
            this.roundEndTimer -= dt;
            if (this.roundEndTimer <= 0) {
                this.round++;
                if (this.ctScore >= Math.ceil(this.maxRounds / 2) + 1 || this.tScore >= Math.ceil(this.maxRounds / 2) + 1 || this.round > this.maxRounds) {
                    this.endGame(); return;
                }
                this.startRound();
            }
            return;
        }

        if (this.roundPhase === 'freeze') {
            this.freezeTimer -= dt;
            if (this.freezeTimer <= 0) { this.roundPhase = 'live'; this.showCenterMessage('GO! GO! GO!', 1500); }
            this.updateCamera(); return;
        }

        this.roundTimer -= dt;
        if (this.roundTimer <= 0 && !this.bombPlanted) { this.endRound('ct', 'Time expired!'); return; }

        if (this.bombPlanted) {
            this.bombTimer -= dt;
            if (this.bombTimer <= 0) { this.bombExplode(); return; }
            this.bombTickTimer += dt;
            const tickInterval = this.bombTimer < 10 ? 0.3 : 0.8;
            if (this.bombTickTimer >= tickInterval) { AudioEngine.play('bomb_tick'); this.bombTickTimer = 0; }
        }

        const player = this.getPlayer();
        if (player && player.alive) {
            const wep = this.getWep(player);
            let speed = wep.moveSpeed;
            if (this.keys['shift']) { speed *= 0.5; player.walking = true; } else player.walking = false;
            let mx = 0, my = 0;
            if (this.keys['w']) my -= 1;
            if (this.keys['s']) my += 1;
            if (this.keys['a']) mx -= 1;
            if (this.keys['d']) mx += 1;
            if (mx || my) {
                const len = Math.sqrt(mx * mx + my * my);
                player.vx = (mx / len) * speed; player.vy = (my / len) * speed;
                player.moving = true;
                player.animTimer += dt;
                this.stepTimer += dt;
                if (this.stepTimer > (player.walking ? 0.5 : 0.3)) {
                    if (!player.walking) AudioEngine.play('step', 0.3);
                    // Footstep dust
                    this.particles.push({
                        x: player.x, y: player.y + 10, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 10,
                        life: 0.4, color: '#88775544', size: 3
                    });
                    this.stepTimer = 0;
                }
            } else { player.vx = 0; player.vy = 0; player.moving = false; }

            const wmx = this.mouse.x + this.camera.x;
            const wmy = this.mouse.y + this.camera.y;
            player.angle = Math.atan2(wmy - player.y, wmx - player.x);
            this.moveEntity(player, dt);

            if (this.mouse.down && !this.buyMenuOpen && !this.scoreboardOpen) this.playerShoot(player);
            if (player.reloading && performance.now() >= player.reloadEnd) this.finishReload(player);
            player.recoilOffset = Math.max(0, player.recoilOffset - dt * 10);

            // Health regeneration: +3 HP/sec when not hit for 3 seconds
            if (performance.now() - (player.lastDamageTime || 0) > 3000 && player.health < player.maxHealth) {
                player.health = Math.min(player.maxHealth, player.health + 3 * dt);
            }
        }

        for (const p of this.players) {
            if (p.isPlayer || !p.alive) continue;
            this.updateBot(p, dt);
            if (p.reloading && performance.now() >= p.reloadEnd) this.finishReload(p);
            p.recoilOffset = Math.max(0, p.recoilOffset - dt * 8);
            if (p.moving) p.animTimer += dt;
        }

        this.updateBullets(dt);

        // Particles
        this.particles = this.particles.filter(p => {
            p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
            p.vx *= 0.92; p.vy *= 0.92; return p.life > 0;
        });

        // Muzzle flashes
        this.muzzleFlashes = this.muzzleFlashes.filter(m => { m.life -= dt; return m.life > 0; });

        // Decals fade over time
        if (this.decals.length > 100) this.decals.splice(0, 20);

        this.killFeed = this.killFeed.filter(k => performance.now() - k.time < 5000);

        // Survival time score: +1 point every 10 seconds alive
        this.survivalTime += dt;
        if (this.survivalTime >= 10) {
            this.survivalTime -= 10;
            this.addScore(1, null, null, '+1 SURVIVE', '#88aa88');
        }

        // Score popups decay
        this.scorePopups = this.scorePopups.filter(p => performance.now() - p.time < 1500);

        // Check player alive - if dead, game over
        if (player && !player.alive && !this.gameOver) {
            this.endGame();
            return;
        }

        const ctAlive = this.players.filter(p => p.team === 'ct' && p.alive).length;
        const tAlive = this.players.filter(p => p.team === 't' && p.alive).length;
        if (ctAlive === 0 && !this.bombPlanted) this.endRound('t', 'All CTs eliminated!');
        else if (tAlive === 0 && !this.bombPlanted) this.endRound('ct', 'All Terrorists eliminated!');

        this.updateCamera(); this.updateHUD();
    }

    moveEntity(e, dt) {
        const nx = e.x + e.vx * dt;
        const ny = e.y + e.vy * dt;
        if (!this.map.checkCollision(nx, e.y, e.radius) && nx > e.radius && nx < this.map.width - e.radius) e.x = nx;
        if (!this.map.checkCollision(e.x, ny, e.radius) && ny > e.radius && ny < this.map.height - e.radius) e.y = ny;
    }

    playerShoot(player) {
        const now = performance.now();
        const wep = this.getWep(player);
        const wepId = this.getWepId(player);
        if (player.reloading) return;
        if (now - player.lastShot < wep.fireRate) return;

        if (wep.type === 'melee') {
            player.lastShot = now; AudioEngine.play(wep.sound);
            this.meleeAttack(player); return;
        }
        if ((player.ammo[wepId] || 0) <= 0) { AudioEngine.play('empty'); this.startReload(); return; }

        player.lastShot = now; player.ammo[wepId]--;
        player.recoilOffset = Math.min(player.recoilOffset + wep.recoil, 15);
        AudioEngine.play(wep.sound);
        this.shake.intensity = Math.min(this.shake.intensity + wep.recoil * 0.8, 8);

        const pellets = wep.burstCount || 1;
        for (let i = 0; i < pellets; i++) {
            const spread = (1 - wep.accuracy) * 0.15 + (player.moving ? 0.03 : 0) + player.recoilOffset * 0.003;
            const angle = player.angle + (Math.random() - 0.5) * spread;
            this.fireBullet(player, angle, wep);
        }
        this.muzzleFlashes.push({ x: player.x, y: player.y, angle: player.angle, life: 0.06 });

        // Shell casing particle
        const casingAngle = player.angle + Math.PI / 2;
        this.particles.push({
            x: player.x + Math.cos(casingAngle) * 8, y: player.y + Math.sin(casingAngle) * 8,
            vx: Math.cos(casingAngle) * 80 + (Math.random() - 0.5) * 40,
            vy: Math.sin(casingAngle) * 80 + (Math.random() - 0.5) * 40,
            life: 0.6, color: '#cc9933', size: 2
        });

        if (!wep.automatic) this.mouse.down = false;
    }

    fireBullet(shooter, angle, wep) {
        this.bullets.push({
            x: shooter.x + Math.cos(angle) * 20, y: shooter.y + Math.sin(angle) * 20,
            vx: Math.cos(angle) * 2000, vy: Math.sin(angle) * 2000,
            damage: wep.damage, headshotMult: wep.headshotMult,
            range: wep.range, traveled: 0, owner: shooter.id,
            team: shooter.team, penetration: wep.penetration, weaponName: wep.name
        });
    }

    meleeAttack(attacker) {
        const wep = this.getWep(attacker);
        for (const t of this.players) {
            if (t.id === attacker.id || t.team === attacker.team || !t.alive) continue;
            const dx = t.x - attacker.x, dy = t.y - attacker.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > wep.range) continue;
            let ad = Math.abs(Math.atan2(dy, dx) - attacker.angle);
            if (ad > Math.PI) ad = Math.PI * 2 - ad;
            if (ad < Math.PI / 3) this.damagePlayer(t, attacker, wep.damage, false, wep.name);
        }
    }

    updateBullets(dt) {
        this.bullets = this.bullets.filter(b => {
            b.x += b.vx * dt; b.y += b.vy * dt;
            b.traveled += Math.sqrt((b.vx * dt) ** 2 + (b.vy * dt) ** 2);
            if (b.traveled > b.range) return false;
            if (this.map.checkCollision(b.x, b.y, 2)) {
                this.spawnWallHit(b.x, b.y); return false;
            }
            for (const p of this.players) {
                if (p.id === b.owner || p.team === b.team || !p.alive) continue;
                const dx = p.x - b.x, dy = p.y - b.y;
                if (dx * dx + dy * dy < (p.radius + 4) ** 2) {
                    const hs = Math.random() < 0.2;
                    const dmg = hs ? b.damage * b.headshotMult : b.damage;
                    this.damagePlayer(p, this.players.find(pl => pl.id === b.owner), dmg, hs, b.weaponName);
                    return false;
                }
            }
            return true;
        });
    }

    damagePlayer(target, attacker, damage, isHeadshot, weaponName) {
        let dmg = damage;
        // Damage reduction: armor absorbs 60% instead of 50%
        if (target.armor > 0) {
            const ab = dmg * 0.6; target.armor = Math.max(0, target.armor - ab); dmg *= 0.4;
            if (isHeadshot && !target.hasHelmet) dmg = damage * 0.8;
        }
        // Slight global damage reduction to make fights last longer
        dmg *= 0.75;
        // Extra reduction for player character
        if (target.isPlayer) dmg *= 0.6;
        target.health -= dmg;
        target.lastDamageTime = performance.now();
        AudioEngine.play(isHeadshot ? 'headshot' : 'hit');
        this.spawnBlood(target.x, target.y);

        if (target.isPlayer) {
            this.showDamageFlash();
            this.shake.intensity = Math.min(this.shake.intensity + 4, 10);
        }

        if (target.health <= 0) {
            target.health = 0; target.alive = false;
            AudioEngine.play('death');
            this.decals.push({ x: target.x, y: target.y, type: 'blood', alpha: 0.7 });
            if (attacker) {
                attacker.kills++;
                attacker.money = Math.min(16000, attacker.money + (WEAPONS[this.getWepId(attacker)]?.killReward || 300));
                if (attacker.isPlayer) {
                    this.playerStats.kills = attacker.kills;
                    this.playerStats.money = attacker.money;
                    // Score for kills
                    const killScore = isHeadshot ? 150 : 100;
                    const label = isHeadshot ? `+${killScore} HEADSHOT!` : `+${killScore} KILL`;
                    const color = isHeadshot ? '#ffcc00' : '#4ade80';
                    this.addScore(killScore, target.x, target.y, label, color);
                }
            }
            target.deaths++;
            if (target.isPlayer) this.playerStats.deaths = target.deaths;
            this.addKillFeed(attacker, target, weaponName, isHeadshot);
        }
    }

    startReload() {
        const p = this.getPlayer();
        if (!p || !p.alive || p.reloading) return;
        const wid = this.getWepId(p); const w = this.getWep(p);
        if (w.type === 'melee' || (p.ammo[wid] || 0) >= w.magSize || (p.reserveAmmo[wid] || 0) <= 0) return;
        p.reloading = true; p.reloadEnd = performance.now() + w.reloadTime;
        AudioEngine.play('reload');
    }

    finishReload(p) {
        const wid = this.getWepId(p); const w = this.getWep(p);
        p.reloading = false;
        const needed = w.magSize - (p.ammo[wid] || 0);
        const avail = Math.min(needed, p.reserveAmmo[wid] || 0);
        p.ammo[wid] = (p.ammo[wid] || 0) + avail;
        p.reserveAmmo[wid] = (p.reserveAmmo[wid] || 0) - avail;
    }

    switchWeaponSlot(slot) {
        const p = this.getPlayer(); if (!p) return;
        for (let i = 0; i < p.weapons.length; i++) {
            const w = WEAPONS[p.weapons[i]];
            if ((slot === 1 && ['rifle', 'smg', 'shotgun', 'sniper'].includes(w.type)) ||
                (slot === 2 && w.type === 'pistol') || (slot === 3 && w.type === 'melee')) {
                p.currentWeapon = i; p.reloading = false; break;
            }
        }
    }

    interactAction() {
        const p = this.getPlayer(); if (!p || !p.alive) return;
        if (p.team === 't' && p.hasBomb && !this.bombPlanted) {
            for (const [k, s] of Object.entries(BOMB_SITES)) {
                if (p.x >= s.x && p.x <= s.x + s.width && p.y >= s.y && p.y <= s.y + s.height) {
                    this.plantBomb(p, s); return;
                }
            }
        }
        if (p.team === 'ct' && this.bombPlanted) {
            const dx = p.x - this.bombPos.x, dy = p.y - this.bombPos.y;
            if (Math.sqrt(dx * dx + dy * dy) < 60) this.startDefuse(p);
        }
    }

    plantBomb(planter, site) {
        this.bombPlanted = true; this.bombPos = { x: planter.x, y: planter.y };
        this.bombTimer = 40; this.bombTickTimer = 0; planter.hasBomb = false;
        AudioEngine.play('bomb_plant');
        this.showCenterMessage('BOMB PLANTED!', 2000);
    }

    startDefuse(player) {
        this.bombDefusing = true;
        this.defuseTimer = player.hasDefuseKit ? 5 : 10;
        this.showCenterMessage('Defusing...', 1000);
        AudioEngine.play('bomb_defuse');
        const iv = setInterval(() => {
            if (!this.bombDefusing || !player.alive || this.roundPhase === 'end') {
                clearInterval(iv); this.bombDefusing = false; return;
            }
            this.defuseTimer -= 0.1;
            if (this.defuseTimer <= 0) {
                clearInterval(iv); this.bombDefusing = false; this.bombPlanted = false;
                this.endRound('ct', 'Bomb defused!');
            }
        }, 100);
    }

    bombExplode() {
        AudioEngine.play('bomb_explode');
        this.shake.intensity = 25;
        if (this.bombPos) {
            for (const p of this.players) {
                if (!p.alive) continue;
                const d = Math.sqrt((p.x - this.bombPos.x) ** 2 + (p.y - this.bombPos.y) ** 2);
                if (d < 500) { p.health -= Math.max(0, 500 - d) * 0.4; if (p.health <= 0) { p.health = 0; p.alive = false; } }
            }
            for (let i = 0; i < 60; i++) {
                this.particles.push({
                    x: this.bombPos.x, y: this.bombPos.y,
                    vx: (Math.random() - 0.5) * 800, vy: (Math.random() - 0.5) * 800,
                    life: 0.8 + Math.random() * 0.8, color: `hsl(${Math.random() * 40 + 10},100%,${50 + Math.random() * 30}%)`, size: 3 + Math.random() * 3
                });
            }
        }
        this.endRound('t', 'Bomb exploded!');
    }

    endRound(winner, reason) {
        if (this.roundPhase === 'end') return;
        this.roundPhase = 'end'; this.roundEndTimer = 4;
        if (winner === 'ct') { this.ctScore++; AudioEngine.play('ct_win'); }
        else { this.tScore++; AudioEngine.play('t_win'); }
        document.getElementById('round-end-text').textContent = winner === 'ct' ? 'CTs WIN!' : 'TERRORISTS WIN!';
        document.getElementById('round-end-text').style.color = winner === 'ct' ? '#5b9bd5' : '#d4a843';
        document.getElementById('round-end-sub').textContent = reason;
        document.getElementById('round-end-overlay').style.display = 'flex';
        const p = this.getPlayer();
        if (p) {
            p.money += (winner === this.playerTeam) ? 3250 : 1400;
            p.money = Math.min(16000, p.money);
            this.playerStats.money = p.money;
            // Round win score bonus
            if (winner === this.playerTeam) {
                this.addScore(200, null, null, '+200 ROUND WIN', '#5b9bd5');
            }
        }
        setTimeout(() => { document.getElementById('round-end-overlay').style.display = 'none'; }, 3000);
    }

    endGame() {
        this.gameOver = true;
        const playerAlive = this.getPlayer()?.alive;
        if (!playerAlive) {
            // Player died - show game over
            document.getElementById('game-over-text').textContent = 'GAME OVER';
            document.getElementById('game-over-text').style.color = '#ef4444';
            document.getElementById('game-over-sub').textContent = 'You were eliminated!';
        } else {
            const w = this.ctScore > this.tScore ? 'ct' : 't';
            document.getElementById('game-over-text').textContent = w === this.playerTeam ? 'VICTORY!' : 'DEFEAT!';
            document.getElementById('game-over-text').style.color = w === this.playerTeam ? '#4ade80' : '#ef4444';
            document.getElementById('game-over-sub').textContent = `${this.ctScore} — ${this.tScore}`;
        }
        document.getElementById('game-over-stats').innerHTML = `
            <div class="stat-card"><div class="stat-value" style="color:#fbbf24">${this.score}</div><div class="stat-label">SCORE</div></div>
            <div class="stat-card"><div class="stat-value">${this.playerStats.kills}</div><div class="stat-label">KILLS</div></div>
            <div class="stat-card"><div class="stat-value">${this.playerStats.deaths}</div><div class="stat-label">DEATHS</div></div>
            <div class="stat-card"><div class="stat-value">${this.round}</div><div class="stat-label">ROUNDS</div></div>`;
        document.getElementById('game-over-overlay').style.display = 'flex';
    }

    // ===== BOT AI =====
    updateBot(bot, dt) {
        bot.aiTimer -= dt;
        if (bot.aiTimer <= 0) { bot.aiTimer = 0.2 + Math.random() * 0.4; this.botThink(bot); }

        if (bot.aiTarget && bot.aiTarget.alive) {
            const dx = bot.aiTarget.x - bot.x, dy = bot.aiTarget.y - bot.y;
            bot.angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (this.map.hasLineOfSight(bot.x, bot.y, bot.aiTarget.x, bot.aiTarget.y)) {
                this.botShoot(bot);
                if (dist > 200) { bot.vx = Math.cos(bot.angle) * 130; bot.vy = Math.sin(bot.angle) * 130; bot.moving = true; }
                else if (dist < 100) { bot.vx = -Math.cos(bot.angle) * 80; bot.vy = -Math.sin(bot.angle) * 80; bot.moving = true; }
                else { bot.vx = 0; bot.vy = 0; bot.moving = false; }
            } else { bot.aiTarget = null; this.botMoveToWaypoint(bot); }
        } else { this.botMoveToWaypoint(bot); }

        this.moveEntity(bot, dt);
        // Stuck detection with sideways nudge
        if (Math.abs(bot.x - bot.lastX) < 1 && Math.abs(bot.y - bot.lastY) < 1) {
            bot.stuckTimer += dt;
            if (bot.stuckTimer > 0.8) {
                // Try nudging sideways
                const nudgeAngle = bot.angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
                const nudgeX = bot.x + Math.cos(nudgeAngle) * 30;
                const nudgeY = bot.y + Math.sin(nudgeAngle) * 30;
                if (!this.map.checkCollision(nudgeX, nudgeY, bot.radius)) {
                    bot.x = nudgeX; bot.y = nudgeY;
                }
                bot.targetWaypoint = this.findNearestWaypoint(bot.x, bot.y);
                bot.stuckTimer = 0;
            }
        } else bot.stuckTimer = 0;
        bot.lastX = bot.x; bot.lastY = bot.y;
    }

    botThink(bot) {
        const enemies = this.players.filter(p => p.team !== bot.team && p.alive);
        let closest = null, cd = Infinity;
        let range = this.difficulty === 'hard' ? 900 : this.difficulty === 'easy' ? 400 : 600;
        for (const e of enemies) {
            const d = Math.sqrt((e.x - bot.x) ** 2 + (e.y - bot.y) ** 2);
            if (d < range && this.map.hasLineOfSight(bot.x, bot.y, e.x, e.y) && d < cd) { closest = e; cd = d; }
        }
        bot.aiTarget = closest;

        if (bot.team === 't' && bot.hasBomb && !this.bombPlanted) {
            const site = Math.random() < 0.5 ? BOMB_SITES.A : BOMB_SITES.B;
            if (bot.x >= site.x && bot.x <= site.x + site.width && bot.y >= site.y && bot.y <= site.y + site.height) {
                this.plantBomb(bot, site);
            }
        }

        const wid = this.getWepId(bot); const w = this.getWep(bot);
        if (w.type !== 'melee' && (bot.ammo[wid] || 0) <= 0 && !bot.reloading && (bot.reserveAmmo[wid] || 0) > 0) {
            bot.reloading = true; bot.reloadEnd = performance.now() + w.reloadTime;
        }
    }

    findNearestWaypoint(x, y) {
        let best = 0, bestDist = Infinity;
        for (let i = 0; i < NAV_WAYPOINTS.length; i++) {
            const wp = NAV_WAYPOINTS[i];
            const d = Math.sqrt((wp.x - x) ** 2 + (wp.y - y) ** 2);
            if (d < bestDist) { bestDist = d; best = i; }
        }
        return best;
    }

    botMoveToWaypoint(bot) {
        if (bot.targetWaypoint < 0 || bot.targetWaypoint >= NAV_WAYPOINTS.length)
            bot.targetWaypoint = this.findNearestWaypoint(bot.x, bot.y);
        const wp = NAV_WAYPOINTS[bot.targetWaypoint];
        const dx = wp.x - bot.x, dy = wp.y - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
            const c = wp.connections;
            // Bias toward enemy side of map for aggressive pathing
            if (c.length > 1 && Math.random() < 0.6) {
                // T bots head right/up, CT bots head left/down
                const target = bot.team === 't' ? { x: 1400, y: 800 } : { x: 700, y: 1200 };
                let bestConn = c[0], bestD = Infinity;
                for (const ci of c) {
                    const cwp = NAV_WAYPOINTS[ci];
                    const cd = Math.sqrt((cwp.x - target.x) ** 2 + (cwp.y - target.y) ** 2);
                    if (cd < bestD) { bestD = cd; bestConn = ci; }
                }
                bot.targetWaypoint = bestConn;
            } else {
                bot.targetWaypoint = c[Math.floor(Math.random() * c.length)];
            }
            return;
        }
        const spd = 170;
        bot.angle = Math.atan2(dy, dx);
        bot.vx = (dx / dist) * spd; bot.vy = (dy / dist) * spd; bot.moving = true;
    }

    botShoot(bot) {
        const now = performance.now();
        const w = this.getWep(bot); const wid = this.getWepId(bot);
        if (bot.reloading) return;
        let frm = this.difficulty === 'easy' ? 2.5 : this.difficulty === 'hard' ? 0.8 : 1;
        if (now - bot.lastShot < w.fireRate * frm) return;
        if (w.type === 'melee') { bot.lastShot = now; this.meleeAttack(bot); return; }
        if ((bot.ammo[wid] || 0) <= 0) return;
        bot.lastShot = now; bot.ammo[wid]--;

        let am = this.difficulty === 'easy' ? 0.6 : this.difficulty === 'hard' ? 1.3 : 1;
        const spread = (1 - w.accuracy * am) * 0.2;
        const angle = bot.angle + (Math.random() - 0.5) * spread;
        this.fireBullet(bot, angle, w);
        this.muzzleFlashes.push({ x: bot.x, y: bot.y, angle: bot.angle, life: 0.06 });
        AudioEngine.play(w.sound, 0.25);
    }

    // ===== CAMERA =====
    updateCamera() {
        const p = this.getPlayer(); if (!p) return;
        const tx = p.x - this.camera.viewWidth / 2;
        const ty = p.y - this.camera.viewHeight / 2;
        this.camera.x += (tx - this.camera.x) * 0.12;
        this.camera.y += (ty - this.camera.y) * 0.12;
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.map.width - this.camera.viewWidth));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.map.height - this.camera.viewHeight));
    }

    // ===== RENDER =====
    render() {
        const { ctx, camera } = this;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        // Screen shake
        ctx.translate(this.shake.x, this.shake.y);

        this.map.render(ctx, camera);

        // Blood decals
        for (const d of this.decals) {
            if (d.type === 'blood') {
                ctx.globalAlpha = d.alpha;
                PixelSprites.drawBloodSplat(ctx, d.x, d.y, camera);
            }
        }
        ctx.globalAlpha = 1;

        // Bomb
        if (this.bombPlanted && this.bombPos) {
            const bx = this.bombPos.x - camera.x, by = this.bombPos.y - camera.y;
            const flash = this.bombTimer < 10 ? (Math.floor(this.bombTimer * 4) % 2 === 0) : false;
            ctx.fillStyle = flash ? '#ff0000' : '#cc6600';
            ctx.fillRect(Math.floor(bx / 2) * 2 - 6, Math.floor(by / 2) * 2 - 6, 12, 12);
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(Math.floor(bx / 2) * 2 - 3, Math.floor(by / 2) * 2 - 3, 6, 6);
            if (flash) {
                ctx.fillStyle = 'rgba(255,0,0,0.15)';
                ctx.beginPath(); ctx.arc(bx, by, 40, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Dead players first
        for (const p of this.players) {
            if (p.alive) continue;
            PixelSprites.drawPlayer(ctx, p, camera, 3);
        }

        // Alive players
        for (const p of this.players) {
            if (!p.alive) continue;
            PixelSprites.drawPlayer(ctx, p, camera, 3);

            const px = p.x - camera.x, py = p.y - camera.y;

            // Damage flash on player
            if (performance.now() - p.lastDamageTime < 150) {
                ctx.fillStyle = 'rgba(255,0,0,0.3)';
                ctx.beginPath(); ctx.arc(px, py, p.radius + 4, 0, Math.PI * 2); ctx.fill();
            }

            // Health bar & name for teammates
            if (!p.isPlayer && p.team === this.playerTeam) {
                const bw = 28, bh = 3;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(px - bw / 2, py - 28, bw, bh);
                ctx.fillStyle = p.health > 50 ? '#4ade80' : p.health > 25 ? '#fbbf24' : '#ef4444';
                ctx.fillRect(px - bw / 2, py - 28, bw * (p.health / 100), bh);
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.font = '9px "Press Start 2P"'; ctx.textAlign = 'center';
                ctx.fillText(p.name, px, py - 32);
            }
        }

        // Bullets - pixel style
        ctx.fillStyle = '#ffdd44';
        for (const b of this.bullets) {
            const bx = Math.floor((b.x - camera.x) / 2) * 2;
            const by = Math.floor((b.y - camera.y) / 2) * 2;
            ctx.fillRect(bx - 1, by - 1, 3, 3);
            // Bullet trail
            ctx.fillStyle = 'rgba(255,220,100,0.3)';
            const tx = bx - (b.vx * 0.005);
            const ty = by - (b.vy * 0.005);
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = 'rgba(255,220,100,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ffdd44';
        }

        // Muzzle flashes - pixel
        for (const m of this.muzzleFlashes) {
            PixelSprites.drawMuzzleFlash(ctx, m.x, m.y, m.angle, camera);
        }

        // Particles - pixel aligned
        for (const p of this.particles) {
            ctx.globalAlpha = Math.min(1, p.life * 2);
            ctx.fillStyle = p.color || '#ff6633';
            const sz = p.size || 2;
            ctx.fillRect(
                Math.floor((p.x - camera.x) / 2) * 2,
                Math.floor((p.y - camera.y) / 2) * 2,
                sz, sz
            );
        }
        ctx.globalAlpha = 1;

        ctx.restore();

        // Crosshair
        if (!this.buyMenuOpen && !this.scoreboardOpen) this.renderCrosshair();

        // Radar
        this.map.renderMinimap(this.radarCtx, 170, 170, this.players, this.playerTeam);

        // Reload bar
        const pl = this.getPlayer();
        if (pl && pl.reloading) {
            const w = this.getWep(pl);
            const progress = 1 - (pl.reloadEnd - performance.now()) / w.reloadTime;
            const bw = 60, bh = 6;
            const bx = this.canvas.width / 2 - bw / 2;
            const by = this.canvas.height / 2 + 30;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(bx, by, bw * Math.min(1, progress), bh);
            ctx.fillStyle = '#fff';
            ctx.font = '7px "Press Start 2P"'; ctx.textAlign = 'center';
            ctx.fillText('RELOADING', this.canvas.width / 2, by - 4);
        }

        // Score popups
        for (const sp of this.scorePopups) {
            const age = (performance.now() - sp.time) / 1500;
            if (sp.x != null && sp.y != null) {
                PixelSprites.drawScorePopup(ctx, sp.x, sp.y, camera, sp.text, sp.color, age);
            } else {
                // Screen-centered popup
                const alpha = Math.max(0, 1 - age);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = sp.color;
                ctx.font = 'bold 10px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText(sp.text, this.canvas.width / 2, this.canvas.height * 0.3 - age * 30);
                ctx.globalAlpha = 1;
            }
        }
    }

    renderCrosshair() {
        const { ctx, mouse } = this;
        const s = 10, g = 4, t = 2;
        ctx.strokeStyle = this.crosshairColor; ctx.lineWidth = t;
        ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y - g); ctx.lineTo(mouse.x, mouse.y - g - s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y + g); ctx.lineTo(mouse.x, mouse.y + g + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mouse.x - g, mouse.y); ctx.lineTo(mouse.x - g - s, mouse.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mouse.x + g, mouse.y); ctx.lineTo(mouse.x + g + s, mouse.y); ctx.stroke();
        ctx.fillStyle = this.crosshairColor;
        ctx.fillRect(mouse.x - 1, mouse.y - 1, 2, 2);
    }

    // ===== FX =====
    spawnBlood(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x, y, vx: (Math.random() - 0.5) * 250, vy: (Math.random() - 0.5) * 250,
                life: 0.3 + Math.random() * 0.4,
                color: ['#cc0000', '#990000', '#aa0000', '#880000'][Math.floor(Math.random() * 4)],
                size: 2 + Math.floor(Math.random() * 2)
            });
        }
    }

    spawnWallHit(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x, y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120,
                life: 0.2 + Math.random() * 0.15, color: '#999', size: 2
            });
        }
        this.decals.push({ x, y, type: 'bullet', alpha: 0.5 });
    }

    showDamageFlash() {
        const el = document.createElement('div');
        el.className = 'damage-flash';
        document.getElementById('game-screen').appendChild(el);
        setTimeout(() => el.remove(), 300);
    }

    // ===== SCORE =====
    addScore(points, x, y, label, color) {
        this.score += points;
        this.scorePopups.push({ x, y, text: label, color, time: performance.now() });
        // Update HUD score
        const el = document.getElementById('score-value');
        if (el) {
            el.textContent = this.score;
            const parent = document.getElementById('score-display');
            if (parent) {
                parent.classList.remove('pulse');
                void parent.offsetWidth; // trigger reflow
                parent.classList.add('pulse');
            }
        }
    }

    // ===== UI =====
    updateHUD() {
        const p = this.getPlayer(); if (!p) return;
        const w = this.getWep(p); const wid = this.getWepId(p);
        document.getElementById('health-text').textContent = Math.ceil(p.health);
        document.getElementById('health-bar').style.width = Math.min(100, (p.health / (p.maxHealth || 250)) * 100) + '%';
        document.getElementById('armor-text').textContent = Math.ceil(p.armor);
        document.getElementById('armor-bar').style.width = p.armor + '%';
        document.getElementById('ct-score').textContent = this.ctScore;
        document.getElementById('t-score').textContent = this.tScore;
        document.getElementById('round-label').textContent = `ROUND ${this.round}`;
        document.getElementById('money-display').textContent = '$' + p.money;
        document.getElementById('weapon-name').textContent = w.name + (p.reloading ? ' [RELOADING]' : '');
        document.getElementById('score-value').textContent = this.score;
        if (w.type === 'melee') {
            document.getElementById('ammo-current').textContent = '∞';
            document.getElementById('ammo-reserve').textContent = '';
        } else {
            document.getElementById('ammo-current').textContent = p.ammo[wid] || 0;
            document.getElementById('ammo-reserve').textContent = p.reserveAmmo[wid] || 0;
        }
        const t = this.bombPlanted ? this.bombTimer : this.roundPhase === 'freeze' ? this.freezeTimer : this.roundTimer;
        const m = Math.floor(t / 60), s = Math.floor(t % 60);
        document.getElementById('timer').textContent = `${m}:${s.toString().padStart(2, '0')}`;
        document.getElementById('timer').style.color = t < 10 ? '#ef4444' : '#fff';
    }

    addKillFeed(killer, victim, weapon, headshot) {
        this.killFeed.push({ time: performance.now() });
        const feed = document.getElementById('kill-feed');
        const e = document.createElement('div');
        e.className = `kill-entry ${killer?.team}-kill`;
        e.innerHTML = `<span class="killer ${killer?.team}-team">${killer?.name || '?'}</span>
            <span class="weapon">[${weapon}]</span>${headshot ? '<span class="hs-icon">★</span>' : ''}
            <span class="victim ${victim.team}-team">${victim.name}</span>`;
        feed.appendChild(e);
        if (feed.children.length > 5) feed.removeChild(feed.firstChild);
        setTimeout(() => { if (e.parentNode) e.remove(); }, 5000);
    }

    showCenterMessage(text, duration) {
        const el = document.getElementById('center-message');
        el.textContent = text; el.style.display = 'block';
        el.style.animation = 'none'; el.offsetHeight;
        el.style.animation = 'messagePulse 0.5s ease-out';
        setTimeout(() => { el.style.display = 'none'; }, duration);
    }

    updateScoreboard() {
        const body = document.getElementById('score-body'); body.innerHTML = '';
        const sorted = [...this.players].sort((a, b) => b.kills - a.kills);
        for (const p of sorted) {
            const tr = document.createElement('tr');
            if (p.isPlayer) tr.className = 'player-row';
            tr.innerHTML = `<td style="color:${p.isPlayer ? '#fff' : '#aaa'}">${p.name}${p.isPlayer ? ' ★' : ''}</td>
                <td style="color:${p.team === 'ct' ? '#5b9bd5' : '#d4a843'}">${p.team.toUpperCase()}</td>
                <td>${p.kills}</td><td>${p.deaths}</td><td style="color:#fbbf24">$${p.money}</td>`;
            body.appendChild(tr);
        }
    }

    toggleBuyMenu() {
        if (this.roundPhase !== 'freeze' && this.roundPhase !== 'live') return;
        this.buyMenuOpen = !this.buyMenuOpen;
        document.getElementById('buy-menu').style.display = this.buyMenuOpen ? 'flex' : 'none';
        if (this.buyMenuOpen) this.populateBuyMenu();
    }

    populateBuyMenu() {
        const p = this.getPlayer(); if (!p) return;
        document.getElementById('buy-money').textContent = '$' + p.money;
        const available = getAvailableWeapons(this.playerTeam);
        const pi = document.getElementById('pistol-items');
        const ri = document.getElementById('rifle-items');
        const ei = document.getElementById('equipment-items');
        pi.innerHTML = ''; ri.innerHTML = ''; ei.innerHTML = '';
        for (const [id, w] of Object.entries(available)) {
            if (w.type === 'melee') continue;
            const d = document.createElement('div');
            d.className = 'buy-item' + (p.money < w.price ? ' disabled' : '');
            d.innerHTML = `<span class="item-name">${w.name}</span><span class="item-price">$${w.price}</span>`;
            d.onclick = () => this.buyWeapon(id);
            if (w.type === 'pistol') pi.appendChild(d); else ri.appendChild(d);
        }
        for (const [id, eq] of Object.entries(EQUIPMENT)) {
            const d = document.createElement('div');
            d.className = 'buy-item' + (p.money < eq.price ? ' disabled' : '');
            d.innerHTML = `<span class="item-name">${eq.name}</span><span class="item-price">$${eq.price}</span>`;
            d.onclick = () => this.buyEquipment(id);
            ei.appendChild(d);
        }
    }

    buyWeapon(weaponId) {
        const p = this.getPlayer(); if (!p) return;
        const w = WEAPONS[weaponId];
        if (p.money < w.price) return;
        p.money -= w.price; this.playerStats.money = p.money;
        const ei = p.weapons.findIndex(ww => {
            const ew = WEAPONS[ww];
            return ew.type === w.type || (ew.slot === w.slot && ew.type !== 'melee');
        });
        if (ei >= 0 && WEAPONS[p.weapons[ei]].type !== 'melee') {
            p.weapons[ei] = weaponId; p.currentWeapon = ei;
        } else { p.weapons.push(weaponId); p.currentWeapon = p.weapons.length - 1; }
        p.ammo[weaponId] = w.magSize; p.reserveAmmo[weaponId] = w.reserveAmmo;
        AudioEngine.play('buy'); this.populateBuyMenu();
    }

    buyEquipment(eqId) {
        const p = this.getPlayer(); if (!p) return;
        const eq = EQUIPMENT[eqId];
        if (p.money < eq.price) return;
        p.money -= eq.price; this.playerStats.money = p.money;
        if (eq.type === 'armor') p.armor = 100;
        else if (eq.type === 'armor_helmet') { p.armor = 100; p.hasHelmet = true; }
        else if (eq.type === 'defuse_kit') p.hasDefuseKit = true;
        AudioEngine.play('buy'); this.populateBuyMenu();
    }

    stop() {
        this.running = false;
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('mousedown', this._onMouseDown);
        this.canvas.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('resize', this._onResize);
    }
}
