import { getLocalProfile, markOnboardingCompleted, shouldShowOnboarding } from './authService.js';

class OnboardingService {
    constructor() {
        this.currentStepIndex = 0;
        this.overlayElement = null;
        this.activeSpotlightElement = null;
        this.isActive = false;

        this.steps = [
            {
                id: 'welcome',
                badge: '🤖 SİBERBALIK • AKADEMİ REHBERİ',
                text: 'Merhaba ben <b>SiberBalık (CyberFish)</b>! Sizlerle siber akademi yolculuğunda birlikte olacağım.',
                target: null,
                hint: 'Akademiye hoş geldin! Temel özellikleri tanımak için adımları takip et.'
            },
            {
                id: 'mission',
                badge: '🛡️ SİBER GÜVENLİK BİLİNCİ',
                text: 'Bu yolculuğun sonunda siber dünyada güvende kalabilmek için <b>daha fazla bilgi ve yetkinliğe</b> sahip olacaksınız.',
                target: null,
                hint: 'Her görev seni gerçek dünyadaki oltalama ve zararlı yazılım tuzaklarına karşı güçlendirecek.'
            },
            {
                id: 'first_game',
                badge: '🎮 İLK OYUNUN & GÖREVLER',
                text: 'Hazırsanız akademideki <b>ilk oyununuzu</b> oynayabilirsiniz! Su altındaki parlayan yemlere doğru yüzerek görevleri başlat.',
                target: null,
                hint: 'Yön (Ok) veya W, A, S, D tuşlarını kullanarak özgürce yüzebilirsin.'
            },
            {
                id: 'how_to_play',
                badge: '❓ YARDIM & OYUN REHBERİ',
                text: 'Oyunlarla ilgili ayrıntılı bilgiye ve kurallara <b>"Nasıl Oynanır"</b> kısmından dilediğiniz an ulaşabilirsiniz.',
                target: '#btn-how-to-play',
                hint: 'Her oyunun kendine has hedeflerini ve puanlama mantığını burada bulabilirsin.'
            },
            {
                id: 'volume',
                badge: '🔊 SES YÖNETİMİ',
                text: 'Ses yönetimi kısmından oyun sesini açıp kapatabilir, <b>ses seviyesini dilediğiniz gibi değiştirebilirsiniz</b>.',
                target: '.volume-control',
                hint: 'Hoparlör ikonuna basarak anında sessize alabilir, kaydırıcıyla seviyeyi ayarlayabilirsin.'
            },
            {
                id: 'profile',
                badge: '⚙️ ÖĞRENCİ KARNESİ & LİDERLİK',
                text: 'Kullanıcı adınıza tıklayarak <b>istatistiki bilgilerinizi, kazandığınız XP puanlarını ve liderlik panosunu</b> görebilirsiniz.',
                target: '#profile-trigger',
                hint: 'Akademide yükseldikçe adın liderlik sıralamasında üst basamaklara çıkacak!'
            },
            {
                id: 'avatar',
                badge: '🎨 AVATAR VE RENK ÖZELLEŞTİRME',
                text: 'Seçtiğiniz avatarı (<b>farklı balık türleri ve renklerini</b>) profil menüsünden dilediğiniz zaman değiştirebilirsiniz.',
                target: '#profile-trigger',
                hint: '7 farklı renk ve havalı iskelet moduyla balığını kendi tarzına göre tasarla!'
            }
        ];
    }

    start(forceManual = false) {
        if (!shouldShowOnboarding(forceManual)) {
            return;
        }

        if (this.isActive) return;

        this.isActive = true;
        window.isOnboardingActive = true;
        this.currentStepIndex = 0;

        // Play feedback sound if phaser is ready
        this.playSound('sfx_message');

        this.renderOverlay();
        this.updateStepView();
    }

    renderOverlay() {
        if (this.overlayElement) {
            this.overlayElement.remove();
        }

        const profile = getLocalProfile();
        const fishColor = profile?.metaData?.color || 'blue';
        const fishType = profile?.metaData?.type || 'standard';
        
        let mascotSrc = `assets/fishpack/fish_${fishColor}.png`;
        if (fishType === 'skeleton') {
            mascotSrc = `assets/fishpack/fish_${fishColor}_skeleton.png`;
        }

        const overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.className = 'onboarding-overlay';

        overlay.innerHTML = `
            <div class="onboarding-card-wrapper">
                <!-- Animated CyberFish Mascot -->
                <div class="onboarding-mascot-container">
                    <div class="mascot-hologram-ring"></div>
                    <img id="onboarding-mascot-img" class="onboarding-mascot-img" src="${mascotSrc}" alt="SiberBalık" />
                    <div class="mascot-badge-pill">SİBERBALIK</div>
                </div>

                <!-- Speech Bubble Card -->
                <div class="onboarding-speech-bubble container">
                    <div class="onboarding-header">
                        <span class="onboarding-badge" id="onboarding-badge">🤖 SİBERBALIK</span>
                        <div class="onboarding-step-counter" id="onboarding-step-counter">1 / 7</div>
                        <button id="btn-onboarding-close-x" class="onboarding-close-x" title="Kapat">&times;</button>
                    </div>

                    <div class="onboarding-text" id="onboarding-text"></div>
                    
                    <div class="onboarding-hint-box" id="onboarding-hint-box">
                        <span class="hint-icon">💡</span>
                        <span id="onboarding-hint-text"></span>
                    </div>

                    <div class="onboarding-footer">
                        <button id="btn-onboarding-prev" class="onboarding-btn secondary">◀ GERİ</button>
                        
                        <div class="onboarding-dots" id="onboarding-dots">
                            ${this.steps.map((_, i) => `<span class="onboarding-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                        </div>

                        <div class="onboarding-actions-right">
                            <button id="btn-onboarding-skip" class="onboarding-btn text-link">Atla</button>
                            <button id="btn-onboarding-next" class="onboarding-btn primary">İLERİ ▶</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.overlayElement = overlay;

        // Button Listeners
        const btnNext = overlay.querySelector('#btn-onboarding-next');
        const btnPrev = overlay.querySelector('#btn-onboarding-prev');
        const btnSkip = overlay.querySelector('#btn-onboarding-skip');
        const btnCloseX = overlay.querySelector('#btn-onboarding-close-x');

        if (btnNext) btnNext.onclick = () => this.nextStep();
        if (btnPrev) btnPrev.onclick = () => this.prevStep();
        if (btnSkip) btnSkip.onclick = () => this.close();
        if (btnCloseX) btnCloseX.onclick = () => this.close();

        // Dot click support
        overlay.querySelectorAll('.onboarding-dot').forEach(dot => {
            dot.onclick = () => {
                const idx = parseInt(dot.getAttribute('data-index'), 10);
                if (!isNaN(idx)) this.goToStep(idx);
            };
        });
    }

    updateStepView() {
        if (!this.overlayElement) return;

        const step = this.steps[this.currentStepIndex];
        const isLastStep = this.currentStepIndex === this.steps.length - 1;

        // Update texts
        const badgeEl = this.overlayElement.querySelector('#onboarding-badge');
        const textEl = this.overlayElement.querySelector('#onboarding-text');
        const hintEl = this.overlayElement.querySelector('#onboarding-hint-text');
        const counterEl = this.overlayElement.querySelector('#onboarding-step-counter');
        const btnNext = this.overlayElement.querySelector('#btn-onboarding-next');
        const btnPrev = this.overlayElement.querySelector('#btn-onboarding-prev');

        if (badgeEl) badgeEl.innerText = step.badge;
        if (textEl) textEl.innerHTML = step.text;
        if (hintEl) hintEl.innerText = step.hint;
        if (counterEl) counterEl.innerText = `${this.currentStepIndex + 1} / ${this.steps.length}`;

        if (btnPrev) {
            btnPrev.style.visibility = this.currentStepIndex === 0 ? 'hidden' : 'visible';
        }

        if (btnNext) {
            if (isLastStep) {
                btnNext.innerText = 'ANLADIM, BAŞLA! 🚀';
                btnNext.classList.add('pulse-glow');
            } else {
                btnNext.innerText = 'İLERİ ▶';
                btnNext.classList.remove('pulse-glow');
            }
        }

        // Update Dots
        this.overlayElement.querySelectorAll('.onboarding-dot').forEach((dot, idx) => {
            dot.classList.toggle('active', idx === this.currentStepIndex);
        });

        // Manage UI Spotlight
        this.highlightTarget(step.target);
    }

    highlightTarget(selector) {
        // Clear existing spotlight
        if (this.activeSpotlightElement) {
            this.activeSpotlightElement.classList.remove('onboarding-spotlight');
            this.activeSpotlightElement = null;
        }

        if (!selector || selector === '#game-container') return;

        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('onboarding-spotlight');
            this.activeSpotlightElement = el;
            
            // If element is not in view, scroll gently
            try {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (e) {}
        }
    }

    nextStep() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.playSound('sfx_click');
            this.updateStepView();
        } else {
            this.close();
        }
    }

    prevStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.playSound('sfx_click');
            this.updateStepView();
        }
    }

    goToStep(index) {
        if (index >= 0 && index < this.steps.length) {
            this.currentStepIndex = index;
            this.playSound('sfx_click');
            this.updateStepView();
        }
    }

    close() {
        this.isActive = false;
        window.isOnboardingActive = false;

        // Clear spotlight
        if (this.activeSpotlightElement) {
            this.activeSpotlightElement.classList.remove('onboarding-spotlight');
            this.activeSpotlightElement = null;
        }

        // Remove overlay with smooth fade
        if (this.overlayElement) {
            this.overlayElement.classList.add('closing');
            setTimeout(() => {
                if (this.overlayElement) {
                    this.overlayElement.remove();
                    this.overlayElement = null;
                }
            }, 300);
        }

        // Mark completed in storage and DB
        const profile = getLocalProfile();
        if (profile?.codename) {
            markOnboardingCompleted(profile.codename);
        }

        this.playSound('sfx_bubble');
    }

    playSound(key) {
        if (window.phaserGame) {
            const scenes = window.phaserGame.scene.getScenes(true);
            if (scenes.length > 0 && scenes[0].sound) {
                try {
                    scenes[0].sound.play(key, { volume: 0.5 });
                } catch (e) {}
            }
        }
    }
}

export const onboardingService = new OnboardingService();
