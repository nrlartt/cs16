// ========== AUDIO ENGINE ==========
// Generates all game sounds procedurally using Web Audio API
const AudioEngine = {
    ctx: null,
    masterVolume: 0.7,
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('AudioContext not available');
        }
    },

    setVolume(v) {
        this.masterVolume = v;
    },

    play(name, volume = 1) {
        if (!this.initialized || !this.ctx) return;
        const vol = volume * this.masterVolume;
        if (vol <= 0) return;

        switch (name) {
            case 'pistol': this.playPistol(vol); break;
            case 'rifle': this.playRifle(vol); break;
            case 'awp': this.playAWP(vol); break;
            case 'knife': this.playKnife(vol); break;
            case 'shotgun': this.playShotgun(vol); break;
            case 'reload': this.playReload(vol); break;
            case 'empty': this.playEmpty(vol); break;
            case 'hit': this.playHit(vol); break;
            case 'headshot': this.playHeadshot(vol); break;
            case 'death': this.playDeath(vol); break;
            case 'bomb_plant': this.playBombPlant(vol); break;
            case 'bomb_defuse': this.playBombDefuse(vol); break;
            case 'bomb_explode': this.playBombExplode(vol); break;
            case 'bomb_tick': this.playBombTick(vol); break;
            case 'buy': this.playBuy(vol); break;
            case 'round_start': this.playRoundStart(vol); break;
            case 'ct_win': this.playCTWin(vol); break;
            case 't_win': this.playTWin(vol); break;
            case 'step': this.playStep(vol); break;
        }
    },

    noise(duration, vol) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * vol;
        }
        return buffer;
    },

    playPistol(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialDecayToValueAtTime?.(0.01, t + 0.12) || gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.12);

        // Noise burst
        const nGain = this.ctx.createGain();
        nGain.connect(this.ctx.destination);
        nGain.gain.setValueAtTime(vol * 0.3, t);
        nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = this.noise(0.08, 1);
        nSrc.connect(nGain);
        nSrc.start(t);
    },

    playRifle(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.1);

        const nGain = this.ctx.createGain();
        nGain.connect(this.ctx.destination);
        nGain.gain.setValueAtTime(vol * 0.4, t);
        nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = this.noise(0.06, 1);
        nSrc.connect(nGain);
        nSrc.start(t);
    },

    playAWP(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.3);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.4);

        const nGain = this.ctx.createGain();
        nGain.connect(this.ctx.destination);
        nGain.gain.setValueAtTime(vol * 0.5, t);
        nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = this.noise(0.15, 1);
        nSrc.connect(nGain);
        nSrc.start(t);
    },

    playKnife(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.15);
    },

    playShotgun(vol) {
        const t = this.ctx.currentTime;
        const nGain = this.ctx.createGain();
        nGain.connect(this.ctx.destination);
        nGain.gain.setValueAtTime(vol * 0.6, t);
        nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = this.noise(0.2, 1);
        nSrc.connect(nGain);
        nSrc.start(t);

        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.15);
    },

    playReload(vol) {
        const t = this.ctx.currentTime;
        // Click 1
        const g1 = this.ctx.createGain();
        g1.connect(this.ctx.destination);
        g1.gain.setValueAtTime(vol * 0.2, t);
        g1.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        const o1 = this.ctx.createOscillator();
        o1.frequency.setValueAtTime(600, t);
        o1.connect(g1);
        o1.start(t);
        o1.stop(t + 0.05);
        // Click 2
        const g2 = this.ctx.createGain();
        g2.connect(this.ctx.destination);
        g2.gain.setValueAtTime(vol * 0.25, t + 0.4);
        g2.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        const o2 = this.ctx.createOscillator();
        o2.frequency.setValueAtTime(800, t + 0.4);
        o2.connect(g2);
        o2.start(t + 0.4);
        o2.stop(t + 0.5);
    },

    playEmpty(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(1200, t);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.05);
    },

    playHit(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.06);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.08);
    },

    playHeadshot(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.15);
    },

    playDeath(vol) {
        const t = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.4);
    },

    playBombPlant(vol) {
        const t = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const g = this.ctx.createGain();
            g.connect(this.ctx.destination);
            g.gain.setValueAtTime(vol * 0.2, t + i * 0.2);
            g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.2 + 0.15);
            const o = this.ctx.createOscillator();
            o.frequency.setValueAtTime(800, t + i * 0.2);
            o.connect(g);
            o.start(t + i * 0.2);
            o.stop(t + i * 0.2 + 0.15);
        }
    },

    playBombDefuse(vol) {
        const t = this.ctx.currentTime;
        const g = this.ctx.createGain();
        g.connect(this.ctx.destination);
        g.gain.setValueAtTime(vol * 0.3, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        const o = this.ctx.createOscillator();
        o.frequency.setValueAtTime(500, t);
        o.frequency.linearRampToValueAtTime(1200, t + 0.5);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.6);
    },

    playBombExplode(vol) {
        const t = this.ctx.currentTime;
        const nGain = this.ctx.createGain();
        nGain.connect(this.ctx.destination);
        nGain.gain.setValueAtTime(vol * 0.8, t);
        nGain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = this.noise(1.0, 1);
        nSrc.connect(nGain);
        nSrc.start(t);

        const g = this.ctx.createGain();
        g.connect(this.ctx.destination);
        g.gain.setValueAtTime(vol * 0.6, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
        const o = this.ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(60, t);
        o.frequency.exponentialRampToValueAtTime(15, t + 0.8);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.8);
    },

    playBombTick(vol) {
        const t = this.ctx.currentTime;
        const g = this.ctx.createGain();
        g.connect(this.ctx.destination);
        g.gain.setValueAtTime(vol * 0.2, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        const o = this.ctx.createOscillator();
        o.frequency.setValueAtTime(1000, t);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.05);
    },

    playBuy(vol) {
        const t = this.ctx.currentTime;
        const g = this.ctx.createGain();
        g.connect(this.ctx.destination);
        g.gain.setValueAtTime(vol * 0.15, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        const o = this.ctx.createOscillator();
        o.frequency.setValueAtTime(600, t);
        o.frequency.linearRampToValueAtTime(900, t + 0.08);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.1);
    },

    playRoundStart(vol) {
        const t = this.ctx.currentTime;
        [523, 659, 784].forEach((freq, i) => {
            const g = this.ctx.createGain();
            g.connect(this.ctx.destination);
            g.gain.setValueAtTime(vol * 0.2, t + i * 0.15);
            g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.25);
            const o = this.ctx.createOscillator();
            o.frequency.setValueAtTime(freq, t + i * 0.15);
            o.connect(g);
            o.start(t + i * 0.15);
            o.stop(t + i * 0.15 + 0.25);
        });
    },

    playCTWin(vol) {
        const t = this.ctx.currentTime;
        [523, 659, 784, 1047].forEach((freq, i) => {
            const g = this.ctx.createGain();
            g.connect(this.ctx.destination);
            g.gain.setValueAtTime(vol * 0.2, t + i * 0.12);
            g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.3);
            const o = this.ctx.createOscillator();
            o.frequency.setValueAtTime(freq, t + i * 0.12);
            o.connect(g);
            o.start(t + i * 0.12);
            o.stop(t + i * 0.12 + 0.3);
        });
    },

    playTWin(vol) {
        const t = this.ctx.currentTime;
        [330, 392, 494, 659].forEach((freq, i) => {
            const g = this.ctx.createGain();
            g.connect(this.ctx.destination);
            g.gain.setValueAtTime(vol * 0.2, t + i * 0.12);
            g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.3);
            const o = this.ctx.createOscillator();
            o.frequency.setValueAtTime(freq, t + i * 0.12);
            o.connect(g);
            o.start(t + i * 0.12);
            o.stop(t + i * 0.12 + 0.3);
        });
    },

    playStep(vol) {
        const t = this.ctx.currentTime;
        const g = this.ctx.createGain();
        g.connect(this.ctx.destination);
        g.gain.setValueAtTime(vol * 0.06, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = this.noise(0.06, 0.5);
        nSrc.connect(g);
        nSrc.start(t);
    }
};
