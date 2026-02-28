// ========== WEAPONS DATABASE ==========
const WEAPONS = {
    knife: {
        name: 'Knife', type: 'melee', slot: 3, damage: 40, headshotMult: 1.5, range: 60,
        fireRate: 500, reloadTime: 0, magSize: Infinity, reserveAmmo: Infinity, moveSpeed: 250,
        price: 0, killReward: 1500, sound: 'knife', accuracy: 1, recoil: 0, penetration: 0,
        automatic: false, burstCount: 1, team: 'all'
    },
    glock: {
        name: 'Glock-18', type: 'pistol', slot: 2, damage: 25, headshotMult: 4, range: 600,
        fireRate: 150, reloadTime: 2200, magSize: 20, reserveAmmo: 120, moveSpeed: 240,
        price: 200, killReward: 300, sound: 'pistol', accuracy: 0.92, recoil: 2, penetration: 0.47,
        automatic: false, burstCount: 1, team: 't'
    },
    usp: {
        name: 'USP-S', type: 'pistol', slot: 2, damage: 30, headshotMult: 4, range: 650,
        fireRate: 170, reloadTime: 2500, magSize: 12, reserveAmmo: 100, moveSpeed: 240,
        price: 200, killReward: 300, sound: 'pistol', accuracy: 0.95, recoil: 1.5, penetration: 0.5,
        automatic: false, burstCount: 1, team: 'ct'
    },
    deagle: {
        name: 'Desert Eagle', type: 'pistol', slot: 2, damage: 53, headshotMult: 4, range: 700,
        fireRate: 350, reloadTime: 2200, magSize: 7, reserveAmmo: 35, moveSpeed: 230,
        price: 700, killReward: 300, sound: 'pistol', accuracy: 0.88, recoil: 5, penetration: 0.75,
        automatic: false, burstCount: 1, team: 'all'
    },
    mp5: {
        name: 'MP5', type: 'smg', slot: 1, damage: 26, headshotMult: 3, range: 500,
        fireRate: 80, reloadTime: 2600, magSize: 30, reserveAmmo: 120, moveSpeed: 235,
        price: 1500, killReward: 600, sound: 'rifle', accuracy: 0.86, recoil: 2.5, penetration: 0.4,
        automatic: true, burstCount: 1, team: 'all'
    },
    shotgun: {
        name: 'XM1014', type: 'shotgun', slot: 1, damage: 20, headshotMult: 2, range: 350,
        fireRate: 350, reloadTime: 3500, magSize: 7, reserveAmmo: 32, moveSpeed: 220,
        price: 3000, killReward: 900, sound: 'shotgun', accuracy: 0.7, recoil: 6, penetration: 0.3,
        automatic: false, burstCount: 6, team: 'all'
    },
    ak47: {
        name: 'AK-47', type: 'rifle', slot: 1, damage: 36, headshotMult: 4, range: 800,
        fireRate: 100, reloadTime: 2500, magSize: 30, reserveAmmo: 90, moveSpeed: 215,
        price: 2700, killReward: 300, sound: 'rifle', accuracy: 0.82, recoil: 4, penetration: 0.77,
        automatic: true, burstCount: 1, team: 't'
    },
    m4a1: {
        name: 'M4A1', type: 'rifle', slot: 1, damage: 33, headshotMult: 4, range: 800,
        fireRate: 90, reloadTime: 3100, magSize: 30, reserveAmmo: 90, moveSpeed: 220,
        price: 3100, killReward: 300, sound: 'rifle', accuracy: 0.88, recoil: 3, penetration: 0.7,
        automatic: true, burstCount: 1, team: 'ct'
    },
    awp: {
        name: 'AWP', type: 'sniper', slot: 1, damage: 115, headshotMult: 4, range: 1200,
        fireRate: 1500, reloadTime: 3500, magSize: 10, reserveAmmo: 30, moveSpeed: 200,
        price: 4750, killReward: 100, sound: 'awp', accuracy: 0.97, recoil: 8, penetration: 0.95,
        automatic: false, burstCount: 1, team: 'all'
    },
    famas: {
        name: 'FAMAS', type: 'rifle', slot: 1, damage: 30, headshotMult: 4, range: 750,
        fireRate: 90, reloadTime: 3300, magSize: 25, reserveAmmo: 90, moveSpeed: 220,
        price: 2250, killReward: 300, sound: 'rifle', accuracy: 0.85, recoil: 2.5, penetration: 0.65,
        automatic: true, burstCount: 1, team: 'ct'
    },
    galil: {
        name: 'Galil', type: 'rifle', slot: 1, damage: 30, headshotMult: 4, range: 750,
        fireRate: 95, reloadTime: 2800, magSize: 35, reserveAmmo: 90, moveSpeed: 215,
        price: 2000, killReward: 300, sound: 'rifle', accuracy: 0.83, recoil: 3, penetration: 0.6,
        automatic: true, burstCount: 1, team: 't'
    }
};

const EQUIPMENT = {
    kevlar: { name: 'Kevlar Vest', price: 650, type: 'armor', value: 100 },
    helmet: { name: 'Kevlar + Helmet', price: 1000, type: 'armor_helmet', value: 100 },
    he_grenade: { name: 'HE Grenade', price: 300, type: 'grenade', damage: 80, radius: 150 },
    flashbang: { name: 'Flashbang', price: 200, type: 'grenade_flash', duration: 3000 },
    smoke: { name: 'Smoke Grenade', price: 300, type: 'grenade_smoke', duration: 15000, radius: 120 },
    defuse_kit: { name: 'Defuse Kit', price: 400, type: 'defuse_kit' }
};

function getDefaultPistol(team) { return team === 'ct' ? 'usp' : 'glock'; }
function getAvailableWeapons(team) {
    const available = {};
    for (const [id, w] of Object.entries(WEAPONS)) {
        if (w.team === 'all' || w.team === team) available[id] = w;
    }
    return available;
}
