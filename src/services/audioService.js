class AudioService {
    constructor() {
        this.bgAudio = null;
        this.currentVolume = 0.35;
        this.isMuted = false;
        this.unlocked = false;
        this.previousVolume = 0.35;
        this._wasPlayingBeforeTabSwitch = false;
    }

    init() {
        // Read volume from localStorage or default to 0.35
        const savedVolume = localStorage.getItem('caq_volume');
        if (savedVolume !== null && !isNaN(parseFloat(savedVolume))) {
            this.currentVolume = Math.min(Math.max(parseFloat(savedVolume), 0), 1);
        } else {
            this.currentVolume = 0.35;
            localStorage.setItem('caq_volume', this.currentVolume.toString());
        }

        this.previousVolume = this.currentVolume > 0 ? this.currentVolume : 0.35;
        this.isMuted = this.currentVolume === 0;

        // Initialize HTML5 Audio for seamless background looping without Web Audio memory bloat
        const audioSrc = new URL('assets/sounds/ocean.mp3', document.baseURI).href;
        this.bgAudio = new Audio(audioSrc);
        this.bgAudio.loop = true;
        this.bgAudio.volume = this.currentVolume;
        this.bgAudio.preload = 'auto';

        // Setup interaction unlocker for modern browser Autoplay Policy
        this.setupUnlockListeners();

        // Handle tab visibility change (pause on background tab, resume on return)
        document.addEventListener('visibilitychange', () => {
            if (!this.bgAudio) return;
            if (document.hidden) {
                if (!this.bgAudio.paused) {
                    this.bgAudio.pause();
                    this._wasPlayingBeforeTabSwitch = true;
                }
            } else {
                if (this._wasPlayingBeforeTabSwitch && !this.isMuted && this.currentVolume > 0) {
                    this.bgAudio.play().catch(() => {});
                    this._wasPlayingBeforeTabSwitch = false;
                }
            }
        });

        // Sync initial UI elements (slider and icon)
        this.syncUI();

        // Attempt initial play
        this.playBGM();
    }

    setupUnlockListeners() {
        const events = ['click', 'pointerdown', 'keydown', 'touchstart'];
        const unlock = () => {
            if (this.unlocked) return;
            this.unlocked = true;

            // 1. Resume Phaser Web Audio Context if suspended
            if (window.phaserGame && window.phaserGame.sound && window.phaserGame.sound.context) {
                if (window.phaserGame.sound.context.state === 'suspended') {
                    window.phaserGame.sound.context.resume().catch(e => console.warn('AudioContext resume failed:', e));
                }
            }

            // 2. Play background audio if not muted and volume > 0
            if (this.bgAudio && !this.isMuted && this.currentVolume > 0 && this.bgAudio.paused) {
                this.bgAudio.play().catch(e => {
                    console.warn('Audio unlock play failed:', e);
                });
            }

            // Remove listeners once unlocked
            events.forEach(evt => window.removeEventListener(evt, unlock, { capture: true }));
            events.forEach(evt => document.removeEventListener(evt, unlock, { capture: true }));
        };

        events.forEach(evt => window.addEventListener(evt, unlock, { capture: true, once: false }));
        events.forEach(evt => document.addEventListener(evt, unlock, { capture: true, once: false }));
    }

    playBGM() {
        if (!this.bgAudio) return;

        this.bgAudio.volume = this.currentVolume;

        if (this.isMuted || this.currentVolume === 0) return;

        if (this.bgAudio.paused) {
            const playPromise = this.bgAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    // Modern browser autoplay policy: waiting for user gesture
                    console.log('BGM waiting for user gesture to play:', err.name);
                });
            }
        }
    }

    pauseBGM() {
        if (this.bgAudio && !this.bgAudio.paused) {
            this.bgAudio.pause();
        }
    }

    setVolume(volume) {
        const vol = Math.min(Math.max(parseFloat(volume), 0), 1);
        this.currentVolume = vol;
        if (vol > 0) {
            this.previousVolume = vol;
            this.isMuted = false;
        } else {
            this.isMuted = true;
        }

        if (this.bgAudio) {
            this.bgAudio.volume = vol;
            if (vol > 0 && this.bgAudio.paused && this.unlocked) {
                this.bgAudio.play().catch(() => {});
            } else if (vol === 0 && !this.bgAudio.paused) {
                this.bgAudio.pause();
            }
        }

        // Also sync Phaser sound manager for short SFX
        if (window.phaserGame && window.phaserGame.sound) {
            window.phaserGame.sound.setVolume(vol);
        }

        localStorage.setItem('caq_volume', vol.toString());
        this.syncUI();
    }

    toggleMute() {
        if (this.isMuted || this.currentVolume === 0) {
            const targetVol = (this.previousVolume && this.previousVolume > 0) ? this.previousVolume : 0.35;
            this.setVolume(targetVol);
        } else {
            this.previousVolume = this.currentVolume;
            this.setVolume(0);
        }
    }

    syncUI() {
        const slider = document.getElementById('vol-slider');
        if (slider) {
            slider.value = this.currentVolume;
        }

        const icon = document.getElementById('vol-icon');
        if (icon) {
            if (this.currentVolume === 0 || this.isMuted) {
                icon.textContent = '🔇';
            } else if (this.currentVolume < 0.5) {
                icon.textContent = '🔉';
            } else {
                icon.textContent = '🔊';
            }
        }
    }
}

export const audioService = new AudioService();
