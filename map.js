// ========== MAP SYSTEM ==========
// Redesigned open map with proper pathways and doorways

const MAP_CONFIG = {
    width: 2800,
    height: 2000,
    tileSize: 40,
    colors: {
        floor: '#3a3520', floorAlt: '#352f1c',
        wall: '#5c4a2a', wallDark: '#3d3118', wallTop: '#6b5830',
        bombSite: 'rgba(255, 80, 80, 0.12)',
        ctSpawn: 'rgba(91, 155, 213, 0.15)',
        tSpawn: 'rgba(212, 168, 67, 0.15)',
        crate: '#5a4828', crateTop: '#6b5a35'
    }
};

// Wall definitions - [x, y, width, height]
// Designed with clear doorways and connected paths
const MAP_WALLS = [
    // ===== OUTER BOUNDARIES =====
    [0, 0, 2800, 25],           // Top
    [0, 1975, 2800, 25],        // Bottom
    [0, 0, 25, 2000],           // Left
    [2775, 0, 25, 2000],        // Right

    // ===== T SPAWN (bottom-left) =====
    // Open area with exits to the right and top
    [25, 1500, 250, 25],        // T spawn top wall (partial)
    // Gap at x:275-400 for exit going right
    [400, 1500, 25, 200],       // T spawn right partial wall
    // Gap at y:1700-1775 for exit going down-right

    // ===== LEFT CORRIDOR (T to Mid) =====
    [25, 1100, 25, 400],        // Left corridor inner wall (partial on left side)
    // This creates a vertical corridor on the left side

    // ===== LONG A PATH (top-left to A site) =====
    [200, 25, 25, 450],         // Long A left wall
    [400, 25, 25, 350],         // Long A right wall
    // Gap at y:375-475 connecting to mid area
    [400, 475, 25, 200],        // Continue right wall below gap

    // ===== A SITE (top-center) =====
    [600, 25, 25, 300],         // A site left boundary
    // Gap at y:325-425
    [600, 425, 25, 150],        // A left boundary continues
    [600, 575, 500, 25],        // A site bottom wall
    // Gap at x:1100-1200
    [1200, 575, 25, 25],        // Small pillar
    [1300, 25, 25, 400],        // A site right wall
    // Gap at y:425-525
    [1300, 525, 25, 75],        // A right continues

    // A site crates/cover
    [750, 150, 60, 60],         // A crate 1
    [950, 300, 50, 50],         // A crate 2
    [1100, 150, 70, 50],        // A crate 3
    [850, 400, 40, 40],         // A small box

    // ===== MID AREA (center of map) =====
    // Vertical corridor through the middle
    [450, 675, 200, 25],        // Mid top-left wall
    // Gap at x:650-750
    [750, 675, 200, 25],        // Mid top-right wall

    [450, 975, 25, 250],        // Mid left wall segment
    // Gap at y:1225-1325
    [450, 1325, 25, 175],       // Mid left continues

    [950, 675, 25, 250],        // Mid right wall segment
    // Gap at y:925-1025
    [950, 1025, 25, 200],       // Mid right continues
    // Gap at y:1225-1350
    [950, 1350, 25, 150],       // Mid right continues

    // Mid cover
    [600, 850, 50, 50],         // Mid box 1
    [750, 1000, 60, 40],        // Mid box 2
    [550, 1150, 40, 60],        // Mid box 3

    // ===== CONNECTOR (Mid to A) =====
    // Open area between mid and A site

    // ===== B TUNNELS (bottom path from T spawn to B) =====
    [400, 1700, 500, 25],       // Tunnel top wall
    // Gap at x:900-1000
    [1000, 1700, 25, 100],      // Tunnel corner
    [400, 1900, 625, 25],       // Tunnel bottom wall (partial)
    // Gap at x:1025-1125

    // ===== B SITE (bottom-right) =====
    [1200, 1400, 25, 300],      // B left wall
    // Gap at y:1700-1800
    [1200, 1800, 25, 175],      // B left continues
    [1200, 1400, 500, 25],      // B top wall
    // Gap at x:1700-1800
    [1800, 1400, 25, 200],      // B right top wall
    // Gap at y:1600-1700
    [1800, 1700, 25, 275],      // B right continues

    // B site cover
    [1350, 1550, 60, 70],       // B crate 1
    [1550, 1650, 50, 60],       // B crate 2
    [1350, 1800, 70, 50],       // B crate 3
    [1600, 1500, 40, 40],       // B small box

    // ===== CT SPAWN (right side) =====
    // Open area with exits to the left
    [2200, 800, 25, 300],       // CT area left wall
    // Gap at y:1100-1250
    [2200, 1250, 25, 300],      // CT area left continues
    // Gap at y:1550-1650

    [2400, 650, 25, 200],       // CT inner wall
    // Gap at y:850-950

    // ===== CT TO A PATH =====
    [1400, 200, 500, 25],       // Upper corridor top
    [1400, 450, 350, 25],       // Upper corridor bottom
    // Gap at x:1750-1850
    [1850, 450, 25, 200],       // Connector wall
    // Gap at y:650-750
    [1850, 750, 25, 200],       // Continues

    // Cover in CT path
    [1550, 300, 50, 50],        // Path crate 1
    [1750, 300, 40, 40],        // Path crate 2

    // ===== CT TO B PATH =====
    [1850, 1200, 350, 25],      // Lower path top
    // Gap at x:2200
    [1850, 1550, 350, 25],      // Lower path bottom

    // Cover in lower path
    [1950, 1350, 50, 60],       // Lower crate 1
    [2100, 1400, 60, 50],       // Lower crate 2

    // ===== CENTER BUILDING =====
    [1050, 800, 300, 25],       // Building top wall
    // Gap at x:1050+120 to 1050+180
    [1050, 1100, 300, 25],      // Building bottom wall
    // Gap at x:1050+120 to 1050+180
    [1050, 825, 25, 120],       // Building left wall
    // Gap at y:945-1005
    [1050, 1005, 25, 95],       // Building left continues
    [1325, 825, 25, 275],       // Building right wall (solid)

    // Building interior cover
    [1150, 900, 40, 40],        // Interior box 1
    [1250, 1000, 35, 35],       // Interior box 2

    // ===== SCATTERED COVER =====
    [300, 800, 50, 50],         // Left area box
    [200, 1300, 60, 40],        // Lower left box
    [1600, 950, 50, 50],        // Right-center box
    [2000, 700, 40, 60],        // CT approach box
    [2300, 1000, 50, 50],       // CT area box
    [2500, 1100, 40, 40],       // Near CT spawn box
    [1700, 1700, 50, 50],       // Near B box
    [2400, 1700, 60, 50],       // Far right box
    [700, 1400, 40, 50],        // Center-left box
    [1500, 1150, 45, 45],       // Below center box
];

// Spawn points - in open areas
const SPAWN_POINTS = {
    ct: [
        { x: 2500, y: 950 },
        { x: 2550, y: 1050 },
        { x: 2600, y: 1150 },
        { x: 2500, y: 1150 },
        { x: 2650, y: 1000 }
    ],
    t: [
        { x: 120, y: 1650 },
        { x: 200, y: 1700 },
        { x: 150, y: 1800 },
        { x: 250, y: 1750 },
        { x: 300, y: 1850 }
    ]
};

// Bomb sites
const BOMB_SITES = {
    A: { x: 700, y: 100, width: 500, height: 400, label: 'A' },
    B: { x: 1250, y: 1475, width: 500, height: 400, label: 'B' }
};

// Navigation waypoints - well-connected network
const NAV_WAYPOINTS = [
    // T Spawn area
    { x: 200, y: 1700, connections: [1, 2, 3] },       // 0 - T Spawn
    // T exits
    { x: 300, y: 1500, connections: [0, 4, 5] },        // 1 - T Spawn exit top
    { x: 200, y: 1850, connections: [0, 3] },            // 2 - T Spawn bottom
    { x: 500, y: 1800, connections: [0, 2, 12] },        // 3 - T toward tunnels

    // Left corridor (T to Long A)
    { x: 150, y: 1200, connections: [1, 5] },            // 4 - Left corridor mid
    { x: 200, y: 900, connections: [4, 1, 6] },          // 5 - Left corridor upper

    // Long A
    { x: 300, y: 500, connections: [5, 7] },              // 6 - Long A entrance
    { x: 300, y: 200, connections: [6, 8] },              // 7 - Long A upper
    { x: 500, y: 150, connections: [7, 9] },              // 8 - Near A site entrance

    // A Site
    { x: 800, y: 250, connections: [8, 10, 11] },         // 9 - A site left
    { x: 1100, y: 200, connections: [9, 11, 18] },        // 10 - A site center
    { x: 1000, y: 450, connections: [9, 10, 15] },        // 11 - A site bottom

    // B Tunnels
    { x: 700, y: 1800, connections: [3, 13] },            // 12 - Tunnel entrance
    { x: 1000, y: 1750, connections: [12, 14] },          // 13 - Tunnel mid
    { x: 1300, y: 1600, connections: [13, 25] },          // 14 - B site entrance

    // Mid area
    { x: 700, y: 800, connections: [11, 6, 16] },         // 15 - Mid top
    { x: 700, y: 1050, connections: [15, 17, 5] },        // 16 - Mid center
    { x: 700, y: 1350, connections: [16, 1, 12] },        // 17 - Mid bottom

    // CT to A path
    { x: 1500, y: 300, connections: [10, 19] },           // 18 - CT-A path start
    { x: 1800, y: 350, connections: [18, 20] },           // 19 - CT-A path mid
    { x: 1900, y: 600, connections: [19, 21, 22] },       // 20 - CT-A connector

    // CT area
    { x: 2100, y: 800, connections: [20, 22, 23] },       // 21 - CT approach
    { x: 2100, y: 1100, connections: [21, 20, 23, 24] },  // 22 - CT mid
    { x: 2500, y: 1050, connections: [21, 22, 24] },      // 23 - CT Spawn
    { x: 2100, y: 1400, connections: [22, 25] },          // 24 - CT to B path

    // B Site
    { x: 1500, y: 1600, connections: [14, 24, 26] },      // 25 - B site
    { x: 1650, y: 1750, connections: [25, 14] },           // 26 - B site inner

    // Center building
    { x: 1200, y: 950, connections: [15, 16, 22, 11] },   // 27 - Center
];

class GameMap {
    constructor() {
        this.walls = MAP_WALLS.map(w => ({ x: w[0], y: w[1], width: w[2], height: w[3] }));
        this.width = MAP_CONFIG.width;
        this.height = MAP_CONFIG.height;
    }

    render(ctx, camera) {
        const { colors } = MAP_CONFIG;

        // Floor
        ctx.fillStyle = colors.floor;
        ctx.fillRect(-camera.x, -camera.y, this.width, this.height);

        // Floor texture pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.015)';
        ctx.lineWidth = 1;
        const ts = MAP_CONFIG.tileSize;
        const sx = Math.floor(camera.x / ts) * ts;
        const sy = Math.floor(camera.y / ts) * ts;
        for (let x = sx; x < camera.x + camera.viewWidth + ts; x += ts) {
            ctx.beginPath(); ctx.moveTo(x - camera.x, 0); ctx.lineTo(x - camera.x, camera.viewHeight); ctx.stroke();
        }
        for (let y = sy; y < camera.y + camera.viewHeight + ts; y += ts) {
            ctx.beginPath(); ctx.moveTo(0, y - camera.y); ctx.lineTo(camera.viewWidth, y - camera.y); ctx.stroke();
        }

        // Alternate floor tiles for visual variety
        for (let x = sx; x < camera.x + camera.viewWidth + ts; x += ts * 2) {
            for (let y = sy; y < camera.y + camera.viewHeight + ts; y += ts * 2) {
                ctx.fillStyle = 'rgba(0,0,0,0.03)';
                ctx.fillRect(x - camera.x, y - camera.y, ts, ts);
                ctx.fillRect(x + ts - camera.x, y + ts - camera.y, ts, ts);
            }
        }

        // Bomb sites
        for (const [key, site] of Object.entries(BOMB_SITES)) {
            ctx.fillStyle = colors.bombSite;
            ctx.fillRect(site.x - camera.x, site.y - camera.y, site.width, site.height);
            ctx.strokeStyle = 'rgba(255, 80, 80, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(site.x - camera.x, site.y - camera.y, site.width, site.height);
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(255, 80, 80, 0.4)';
            ctx.font = 'bold 40px Rajdhani';
            ctx.textAlign = 'center';
            ctx.fillText(site.label, site.x + site.width / 2 - camera.x, site.y + site.height / 2 + 14 - camera.y);
        }

        // CT Spawn zone
        ctx.fillStyle = colors.ctSpawn;
        ctx.fillRect(2350 - camera.x, 850 - camera.y, 400, 400);
        ctx.fillStyle = 'rgba(91, 155, 213, 0.35)';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('CT', 2550 - camera.x, 1060 - camera.y);

        // T Spawn zone
        ctx.fillStyle = colors.tSpawn;
        ctx.fillRect(50 - camera.x, 1550 - camera.y, 350, 400);
        ctx.fillStyle = 'rgba(212, 168, 67, 0.35)';
        ctx.fillText('T', 225 - camera.x, 1760 - camera.y);

        // Walls
        for (const wall of this.walls) {
            const wx = wall.x - camera.x;
            const wy = wall.y - camera.y;
            // Skip if off screen
            if (wx + wall.width < -50 || wx > camera.viewWidth + 50 ||
                wy + wall.height < -50 || wy > camera.viewHeight + 50) continue;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(wx + 3, wy + 3, wall.width, wall.height);

            // Determine if it's a thin wall or a crate
            const isThin = wall.width <= 25 || wall.height <= 25;
            const isCrate = !isThin && wall.width <= 70 && wall.height <= 70;

            if (isCrate) {
                // Crate rendering
                ctx.fillStyle = colors.crate;
                ctx.fillRect(wx, wy, wall.width, wall.height);
                ctx.fillStyle = colors.crateTop;
                ctx.fillRect(wx + 3, wy + 3, wall.width - 6, wall.height - 6);
                // Cross pattern on crate
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(wx, wy);
                ctx.lineTo(wx + wall.width, wy + wall.height);
                ctx.moveTo(wx + wall.width, wy);
                ctx.lineTo(wx, wy + wall.height);
                ctx.stroke();
            } else {
                // Wall body
                ctx.fillStyle = isThin ? colors.wall : colors.wallDark;
                ctx.fillRect(wx, wy, wall.width, wall.height);
                // Top highlight
                ctx.fillStyle = colors.wallTop;
                if (wall.height <= 25) {
                    ctx.fillRect(wx, wy, wall.width, 4);
                } else {
                    ctx.fillRect(wx, wy, 4, wall.height);
                }
            }
            // Border
            ctx.strokeStyle = 'rgba(0,0,0,0.35)';
            ctx.lineWidth = 1;
            ctx.strokeRect(wx, wy, wall.width, wall.height);
        }

        // Area labels
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.font = '14px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('LONG A', 300 - camera.x, 300 - camera.y);
        ctx.fillText('MID', 700 - camera.x, 1050 - camera.y);
        ctx.fillText('TUNNELS', 700 - camera.x, 1800 - camera.y);
        ctx.fillText('CONNECTOR', 1200 - camera.x, 650 - camera.y);

        ctx.textAlign = 'left';
    }

    checkCollision(x, y, radius) {
        for (const wall of this.walls) {
            const cx = Math.max(wall.x, Math.min(x, wall.x + wall.width));
            const cy = Math.max(wall.y, Math.min(y, wall.y + wall.height));
            const dx = x - cx, dy = y - cy;
            if (dx * dx + dy * dy < radius * radius) return wall;
        }
        return null;
    }

    raycast(x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(dist / 4);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x1 + dx * t, py = y1 + dy * t;
            for (const wall of this.walls) {
                if (px >= wall.x && px <= wall.x + wall.width &&
                    py >= wall.y && py <= wall.y + wall.height) {
                    return { hit: true, x: px, y: py, dist: dist * t };
                }
            }
        }
        return { hit: false, x: x2, y: y2, dist };
    }

    hasLineOfSight(x1, y1, x2, y2) {
        const r = this.raycast(x1, y1, x2, y2);
        if (!r.hit) return true;
        const td = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return r.dist >= td - 5;
    }

    renderMinimap(ctx, cw, ch, players, playerTeam) {
        const scale = Math.min(cw / this.width, ch / this.height);
        const ox = (cw - this.width * scale) / 2;
        const oy = (ch - this.height * scale) / 2;

        ctx.fillStyle = 'rgba(15, 15, 25, 0.92)';
        ctx.fillRect(0, 0, cw, ch);

        ctx.fillStyle = 'rgba(60, 50, 35, 0.4)';
        ctx.fillRect(ox, oy, this.width * scale, this.height * scale);

        // Walls
        ctx.fillStyle = 'rgba(120, 100, 70, 0.7)';
        for (const w of this.walls) {
            ctx.fillRect(ox + w.x * scale, oy + w.y * scale,
                Math.max(w.width * scale, 1), Math.max(w.height * scale, 1));
        }

        // Bomb sites
        for (const [k, s] of Object.entries(BOMB_SITES)) {
            ctx.fillStyle = 'rgba(255, 80, 80, 0.2)';
            ctx.fillRect(ox + s.x * scale, oy + s.y * scale, s.width * scale, s.height * scale);
            ctx.fillStyle = 'rgba(255, 80, 80, 0.5)';
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(s.label, ox + (s.x + s.width / 2) * scale, oy + (s.y + s.height / 2) * scale + 3);
        }

        // Players
        for (const p of players) {
            if (!p.alive) continue;
            const px = ox + p.x * scale, py = oy + p.y * scale;

            if (p.team === playerTeam || p.isPlayer) {
                ctx.fillStyle = p.team === 'ct' ? '#5b9bd5' : '#d4a843';
                ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();

                if (p.isPlayer) {
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(px, py);
                    ctx.lineTo(px + Math.cos(p.angle) * 8, py + Math.sin(p.angle) * 8);
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
                }
            } else {
                // Show enemies on radar only if close or spotted
                // For now, show as red dots if within range
                const player = players.find(pl => pl.isPlayer);
                if (player) {
                    const d = Math.sqrt((p.x - player.x) ** 2 + (p.y - player.y) ** 2);
                    if (d < 500) {
                        ctx.fillStyle = 'rgba(255,50,50,0.6)';
                        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }
        }
        ctx.textAlign = 'left';
    }
}
