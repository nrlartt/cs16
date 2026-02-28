// ========== PIXEL ART SPRITE SYSTEM ==========
// Enhanced detailed pixel art characters

const PixelSprites = {
    cache: {},

    // CT Soldier - 12x20 detailed pixel art
    // Blue uniform, tactical helmet, vest, boots
    ctBody: [
        '....0000....',
        '...077770...',
        '..07777770..',
        '..07766770..',
        '..07744770..',
        '...074470...',
        '....0440....',
        '..00666600..',
        '.0666116660.',
        '.0661111660.',
        '06661111660.',
        '066611116660',
        '.0666116660.',
        '..06666660..',
        '..06600660..',
        '..06600660..',
        '..06600660..',
        '..00000000..',
        '..09900990..',
        '..09900990..',
    ],

    // T Soldier - 12x20 detailed pixel art
    // Olive/brown uniform, balaclava, vest
    tBody: [
        '....0000....',
        '...033330...',
        '..03333330..',
        '..03333330..',
        '..03544530..',
        '...054450...',
        '....0440....',
        '..00333300..',
        '.0338888330.',
        '.0388228830.',
        '03882222830.',
        '038822228330',
        '.0338888330.',
        '..03333330..',
        '..03300330..',
        '..03300330..',
        '..03300330..',
        '..00000000..',
        '..02200220..',
        '..02200220..',
    ],

    // Enhanced palette with more colors
    palette: {
        '.': null,           // transparent
        '0': '#0a0a0a',      // outline black
        '1': '#1e3a5c',      // CT dark navy
        '2': '#3a2a18',      // T dark brown (boots)
        '3': '#5a6a3a',      // T olive green
        '4': '#e8cba0',      // skin tone
        '5': '#c4a880',      // skin shadow
        '6': '#3868a8',      // CT blue uniform
        '7': '#4a5a6a',      // helmet/metal gray
        '8': '#4a5428',      // T vest dark olive
        '9': '#2a2a2a',      // CT boots dark
        'A': '#ff4444',      // red accent
        'B': '#ffcc00',      // gold accent
        'C': '#ffffff',      // white highlight
        'D': '#6090c0',      // CT light blue
        'E': '#7a8a4a',      // T light olive
    },

    // Weapon sprites (more detailed)
    weaponPixels: {
        pistol: [
            ['.', '7', '7', '7', '7', '0'],
            ['.', '0', '7', 'C', '0', '.'],
            ['.', '.', '0', '0', '.', '.'],
        ],
        rifle: [
            ['7', '7', '7', '7', '7', '7', '7', '7', '0'],
            ['0', '0', '7', 'C', '7', '0', '.', '.', '.'],
            ['.', '.', '0', '0', '0', '.', '.', '.', '.'],
        ],
        awp: [
            ['7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '0'],
            ['0', '0', '0', '7', 'C', '7', '7', '0', '.', '.', '.'],
            ['.', '.', '.', '0', '0', '0', '0', '.', '.', '.', '.'],
        ],
        knife: [
            ['C', 'C', 'A', 'A', '0'],
            ['.', '0', '0', '0', '.'],
        ],
        shotgun: [
            ['7', '7', '7', '7', '7', '7', '7', '0'],
            ['0', '0', '7', '7', 'C', '0', '.', '.'],
            ['.', '.', '0', '0', '0', '.', '.', '.'],
        ],
    },

    renderSprite(pixelGrid, palette, pixelSize = 2) {
        const h = pixelGrid.length;
        const w = pixelGrid[0].length;
        const canvas = document.createElement('canvas');
        canvas.width = w * pixelSize;
        canvas.height = h * pixelSize;
        const ctx = canvas.getContext('2d');
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const ch = pixelGrid[y][x];
                const color = palette[ch];
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        return canvas;
    },

    init() {
        const sizes = [2, 3, 4];
        sizes.forEach(size => {
            this.cache[`ct_${size}`] = this.renderSprite(this.ctBody, this.palette, size);
            this.cache[`t_${size}`] = this.renderSprite(this.tBody, this.palette, size);

            // Dead versions (darker, desaturated)
            const deadPalette = {};
            for (const [k, v] of Object.entries(this.palette)) {
                if (v === null) deadPalette[k] = null;
                else deadPalette[k] = this.desaturate(v, 0.3);
            }
            this.cache[`ct_dead_${size}`] = this.renderSprite(this.ctBody, deadPalette, size);
            this.cache[`t_dead_${size}`] = this.renderSprite(this.tBody, deadPalette, size);

            // Hit flash versions (white-tinted for damage feedback)
            const hitPalette = {};
            for (const [k, v] of Object.entries(this.palette)) {
                if (v === null) hitPalette[k] = null;
                else hitPalette[k] = this.lighten(v, 0.6);
            }
            this.cache[`ct_hit_${size}`] = this.renderSprite(this.ctBody, hitPalette, size);
            this.cache[`t_hit_${size}`] = this.renderSprite(this.tBody, hitPalette, size);

            // Weapon sprites
            for (const [name, grid] of Object.entries(this.weaponPixels)) {
                this.cache[`weapon_${name}_${size}`] = this.renderSprite(grid, this.palette, size);
            }
        });

        // Large preview for team select
        this.cache['ct_preview'] = this.renderSprite(this.ctBody, this.palette, 4);
        this.cache['t_preview'] = this.renderSprite(this.tBody, this.palette, 4);
    },

    desaturate(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const gray = (r + g + b) / 3;
        return `rgb(${Math.floor(gray * factor)},${Math.floor(gray * factor)},${Math.floor(gray * factor)})`;
    },

    lighten(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))},${Math.min(255, Math.floor(g + (255 - g) * factor))},${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
    },

    drawPlayer(ctx, player, camera, pixelSize = 3) {
        // Choose sprite variant
        let variant = '';
        if (!player.alive) {
            variant = 'dead_';
        } else if (player.lastDamageTime && performance.now() - player.lastDamageTime < 100) {
            variant = 'hit_';
        }
        const key = `${player.team}_${variant}${pixelSize}`;
        const sprite = this.cache[key];
        if (!sprite) return;

        const sx = player.x - camera.x;
        const sy = player.y - camera.y;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(player.angle + Math.PI / 2);

        // Shadow under character
        if (player.alive) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(2, 4, sprite.width * 0.35, sprite.height * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw character sprite centered
        const alpha = player.alive ? 1 : 0.6;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);

        // Draw weapon
        if (player.alive) {
            const wepType = this.getWeaponType(player);
            const wepKey = `weapon_${wepType}_${pixelSize}`;
            const wepSprite = this.cache[wepKey];
            if (wepSprite) {
                ctx.drawImage(wepSprite, 4, -sprite.height / 2 - wepSprite.height + 4);
            }
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    },

    getWeaponType(player) {
        if (!player.weapons || !player.weapons[player.currentWeapon]) return 'pistol';
        const wepId = player.weapons[player.currentWeapon];
        const wep = WEAPONS[wepId];
        if (!wep) return 'pistol';
        if (wep.type === 'melee') return 'knife';
        if (wep.type === 'pistol') return 'pistol';
        if (wep.type === 'sniper') return 'awp';
        if (wep.type === 'shotgun') return 'shotgun';
        return 'rifle';
    },

    drawPreview(canvasId, team) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const key = `${team}_preview`;
        const sprite = this.cache[key];
        if (sprite) {
            ctx.drawImage(sprite, (canvas.width - sprite.width) / 2, (canvas.height - sprite.height) / 2);
        }
    },

    drawExplosion(ctx, x, y, camera, frame) {
        const colors = ['#ff2200', '#ff5500', '#ff8800', '#ffcc00', '#ffffff'];
        const size = Math.min(frame * 5, 50);
        const px = x - camera.x, py = y - camera.y;
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i + frame * 0.15;
            const dist = size * (0.4 + Math.random() * 0.6);
            const ex = px + Math.cos(angle) * dist;
            const ey = py + Math.sin(angle) * dist;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const ps = 2 + Math.floor(Math.random() * 4);
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor(ex / 2) * 2, Math.floor(ey / 2) * 2, ps, ps);
        }
    },

    drawBloodSplat(ctx, x, y, camera) {
        const px = x - camera.x, py = y - camera.y;
        const colors = ['#cc0000', '#990000', '#660000', '#aa0000', '#770000'];
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const ox = Math.floor((Math.random() - 0.5) * 20 / 2) * 2;
            const oy = Math.floor((Math.random() - 0.5) * 20 / 2) * 2;
            const sz = 2 + Math.floor(Math.random() * 3);
            ctx.fillRect(px + ox, py + oy, sz, sz);
        }
    },

    drawMuzzleFlash(ctx, x, y, angle, camera) {
        const px = x - camera.x + Math.cos(angle) * 24;
        const py = y - camera.y + Math.sin(angle) * 24;
        const colors = ['#ffffff', '#ffff66', '#ffaa00', '#ff6600'];
        // Bright center
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(px / 2) * 2 - 2, Math.floor(py / 2) * 2 - 2, 4, 4);
        // Sparks
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const ox = Math.cos(angle + (Math.random() - 0.5) * 1.2) * (6 + Math.random() * 10);
            const oy = Math.sin(angle + (Math.random() - 0.5) * 1.2) * (6 + Math.random() * 10);
            ctx.fillRect(Math.floor((px + ox) / 2) * 2, Math.floor((py + oy) / 2) * 2, 2, 2);
        }
    },

    // Score popup effect
    drawScorePopup(ctx, x, y, camera, text, color, age) {
        const px = x - camera.x;
        const py = y - camera.y - age * 40;
        const alpha = Math.max(0, 1 - age);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.font = 'bold 10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(text, px, py);
        ctx.globalAlpha = 1;
    }
};
