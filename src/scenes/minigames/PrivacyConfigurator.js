import { MiniGameScene } from './MiniGameScene';
import { getLocalProfile } from '../../services/authService';

export class PrivacyConfigurator extends MiniGameScene {
    constructor() {
        super('PrivacyConfigurator');
    }

    create() {
        this.createBaseUI('Sosyal Medya Gizlilik Yapılandırıcı');
        const { width, height } = this.cameras.main;

        // Force hide Phaser-based guide fish and bubble in this scene (we use DOM instead)
        if (this.guideFish) {
            this.guideFish.setVisible(false);
            this.guideFish.setActive(false);
        }
        if (this.activeBubble) {
            this.activeBubble.setVisible(false);
            this.activeBubble.setActive(false);
        }

        this.showGuideMessage("Balığının sosyal medya hesabını en güvenli hale getir! Her ayarı dikkatlice incele.");

        this.settings = [
            { id: 1, text: 'Profil fotoğrafımı kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yalnız Ben'], correct: 'Arkadaşlar' },
            { id: 2, text: 'Paylaşımlarımı kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yalnız Ben'], correct: 'Arkadaşlar' },
            { id: 3, text: 'Hikâyelerimi kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yakın Arkadaşlar'], correct: 'Yakın Arkadaşlar' },
            { id: 4, text: 'Yaşadığım yeri kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yalnız Ben'], correct: 'Yalnız Ben' },
            { id: 5, text: 'Telefon numaramı kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yalnız Ben'], correct: 'Yalnız Ben' },
            { id: 6, text: 'Mail adresimi kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yalnız Ben'], correct: 'Yalnız Ben' },
            { id: 7, text: 'Doğum günümü kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yalnız Ben'], correct: 'Arkadaşlar' },
            { id: 8, text: 'Okul bilgilerimi kim görsün?', options: ['Herkes', 'Arkadaşlar', 'Yalnız Ben'], correct: 'Yalnız Ben' },
            { id: 9, text: 'Konum paylaşımı açık mı?', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 10, text: 'Hesabım gizli olsun mu?', options: ['Açık', 'Kapalı'], correct: 'Açık' },
            { id: 11, text: 'Tanımadığım kişiler mesaj atabilsin mi?', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 12, text: 'Etiketlenmeden önce onay iste', options: ['Açık', 'Kapalı'], correct: 'Açık' },
            { id: 13, text: 'Fotoğraflarımı indirilebilir yap', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 14, text: 'Şifremi tarayıcı kaydetsin mi?', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 15, text: 'İki adımlı doğrulama kullan', options: ['Açık', 'Kapalı'], correct: 'Açık' },
            { id: 16, text: 'Son görülmemi göster', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 17, text: 'Arkadaş listemi herkes görsün mü?', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 18, text: 'Kamera ve mikrofon erişimi', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 19, text: 'Reklam kişiselleştirme', options: ['Açık', 'Kapalı'], correct: 'Kapalı' },
            { id: 20, text: 'Oyun hesabına giriş bildirimleri', options: ['Açık', 'Kapalı'], correct: 'Açık' }
        ];

        this.posts = [
            { id: 1, text: 'Bugün ailemle tatile gidiyoruz, evde kimse olmayacak!', isSafe: false },
            { id: 2, text: 'Yeni çizdiğim deniz yıldızı resmini çok sevdim!', isSafe: true },
            { id: 3, text: 'Telefon numaramı isteyen herkese gönderebilirim.', isSafe: false },
            { id: 4, text: 'Arkadaşlarımla birlikte oyun oynadık, çok eğlendik!', isSafe: true },
            { id: 5, text: 'Şifrem balık123 😎', isSafe: false },
            { id: 6, text: 'Bugün güvenli internet kullanmayı öğrendim.', isSafe: true },
            { id: 7, text: 'Şu an evde yalnızım.', isSafe: false },
            { id: 8, text: 'Yeni yüzme madalyamı kazandım!', isSafe: true },
            { id: 9, text: 'Okulumun adresi şu sokakta…', isSafe: false },
            { id: 10, text: 'Bugün öğretmenimle eğlenceli bir deney yaptık.', isSafe: true },
            { id: 11, text: 'Canlı konumumu herkese açtım!', isSafe: false },
            { id: 12, text: 'Yakın arkadaşlarımla grup çalışması yaptık.', isSafe: true },
            { id: 13, text: 'Beni tanımayan bir balık bana mesaj attı, hemen cevap veriyorum!', isSafe: false },
            { id: 14, text: 'Güçlü şifre oluşturmayı öğrendim.', isSafe: true },
            { id: 15, text: 'Kimlik kartımın fotoğrafını paylaşıyorum.', isSafe: false },
            { id: 16, text: 'Bugün denizi temizlemek için arkadaşlarımla etkinlik yaptık.', isSafe: true },
            { id: 17, text: 'Doğum günüm ve yaşım burada yazıyor!', isSafe: false },
            { id: 18, text: 'İki adımlı doğrulamayı açtım.', isSafe: true },
            { id: 19, text: 'Bedava ödül kazandım, linke hemen tıkladım!', isSafe: false },
            { id: 20, text: 'Siber güvenlik kurallarını öğrenmek çok eğlenceli!', isSafe: true }
        ];

        this.currentTab = 'settings';
        this.completedSettings = new Set();
        this.completedPosts = new Set();
        this.renderProfileUI();
    }

    renderProfileUI() {
        const overlay = document.getElementById('ui-overlay');
        overlay.innerHTML = '';
        
        const profile = getLocalProfile() || { codename: 'SiberBalik', metaData: { color: 'blue', type: 'standard' } };
        const fishColor = profile.metaData?.color || 'blue';
        const fishType = profile.metaData?.type || 'standard';
        
        let fishImg = `assets/fishpack/fish_${fishColor}.png`;
        if (fishType === 'skeleton') {
            fishImg = `assets/fishpack/fish_${fishColor}_skeleton.png`;
        }

        const colorMap = { 'blue': '#00f2ff', 'green': '#00ff00', 'orange': '#ffaa00', 'pink': '#ff00ff', 'red': '#ff0000' };

        overlay.innerHTML = `
            <!-- DOM-based Guide Fish (Always on Top) -->
            <div id="dom-guide-wrapper" style="position: absolute; bottom: 20px; left: 20px; z-index: 2000; pointer-events: none; display: flex; flex-direction: column; align-items: center;">
                <div id="dom-guide-bubble" class="tooltip" style="display: none; margin-bottom: 35px; font-size: 15px;">
                    <span id="dom-guide-text"></span>
                </div>
                <img src="${fishImg}" style="width: 80px; height: auto; filter: drop-shadow(0 0 10px ${colorMap[fishColor]});">
            </div>

            <div id="main-panel" style="position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 800px; height: 75vh; background: rgba(10, 20, 40, 0.95); border: 3px solid #00f2ff; border-radius: 20px; color: white; display: flex; flex-direction: column; overflow: hidden; pointer-events: all; box-shadow: 0 0 50px rgba(0,242,255,0.3);">
                <!-- Header: Profile Info -->
                <div style="padding: 20px; background: rgba(0, 242, 242, 0.1); border-bottom: 1px solid #00f2ff; display: flex; align-items: center; gap: 20px;">
                    <div style="width: 80px; height: 80px; background: #000; border-radius: 50%; border: 3px solid ${colorMap[fishColor]}; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05);">
                        <img src="${fishImg}" style="width: 60px; height: auto; filter: drop-shadow(0 0 5px ${colorMap[fishColor]});">
                    </div>
                    <div style="flex: 1;">
                        <h2 style="margin: 0; color: #f3ff00;">@${profile.codename}</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">Akademi Öğrencisi | Siber Koruyucu</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 24px; font-weight: bold; color: #00f2ff;" id="ui-score">PUAN: ${this.score}</div>
                        <div style="font-size: 12px; color: #f3ff00;">GİZLİLİK SKORU</div>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display: flex; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(0,242,255,0.2);">
                    <button id="tab-settings" style="flex: 1; padding: 15px; background: ${this.currentTab === 'settings' ? 'rgba(0,242,255,0.2)' : 'transparent'}; border: none; color: white; cursor: pointer; border-bottom: 2px solid ${this.currentTab === 'settings' ? '#00f2ff' : 'transparent'};">GİZLİLİK AYARLARI</button>
                    <button id="tab-posts" style="flex: 1; padding: 15px; background: ${this.currentTab === 'posts' ? 'rgba(0,242,255,0.2)' : 'transparent'}; border: none; color: white; cursor: pointer; border-bottom: 2px solid ${this.currentTab === 'posts' ? '#00f2ff' : 'transparent'};">PAYLAŞIMLARIM</button>
                </div>

                <!-- Content Area -->
                <div style="flex: 1; overflow-y: auto; padding: 20px;" id="content-container">
                    ${this.currentTab === 'settings' ? this.getSettingsHTML() : this.getPostsHTML()}
                </div>

                <!-- Footer Progress -->
                <div style="padding: 10px 20px; background: rgba(0,0,0,0.4); display: flex; justify-content: space-between; font-size: 12px; color: #00f2ff;">
                    <span>Ayarlar: ${this.completedSettings.size}/20</span>
                    <span>Paylaşımlar: ${this.completedPosts.size}/20</span>
                </div>
            </div>

            <!-- Decision Modal -->
            <div id="post-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100; align-items: center; justify-content: center; pointer-events: all;">
                <div style="width: 400px; background: #1a1a2e; border: 2px solid #00f2ff; border-radius: 15px; padding: 30px; text-align: center; color: white;">
                    <h3 style="color: #f3ff00; margin-bottom: 20px;">Bu Paylaşımı Yapalım mı?</h3>
                    <p id="modal-post-text" style="font-style: italic; margin-bottom: 30px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;"></p>
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button id="btn-share" style="padding: 12px 25px; background: #00ff00; border: none; border-radius: 8px; color: #000; font-weight: bold; cursor: pointer;">PAYLAŞ ✅</button>
                        <button id="btn-dont-share" style="padding: 12px 25px; background: #ff0000; border: none; border-radius: 8px; color: #fff; font-weight: bold; cursor: pointer;">PAYLAŞMA ❌</button>
                    </div>
                    <button id="close-modal" style="margin-top: 20px; background: transparent; border: 1px solid #aaa; color: #aaa; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Vazgeç</button>
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    getSettingsHTML() {
        return this.settings.map(s => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid rgba(0,242,255,0.1);">
                <div style="flex: 1; font-size: 15px;">${s.id}. ${s.text}</div>
                <div style="display: flex; gap: 10px;" id="options-${s.id}">
                    ${s.options.map(opt => `
                        <button class="privacy-opt" data-sid="${s.id}" data-val="${opt}" style="padding: 8px 15px; background: rgba(255,255,255,0.05); border: 1px solid #00f2ff; color: #00f2ff; border-radius: 5px; cursor: pointer; font-size: 12px;">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getPostsHTML() {
        const profile = getLocalProfile() || { metaData: { color: 'blue', type: 'standard' } };
        const fishColor = profile.metaData?.color || 'blue';
        const fishType = profile.metaData?.type || 'standard';
        let fishImg = `assets/fishpack/fish_${fishColor}.png`;
        if (fishType === 'skeleton') fishImg = `assets/fishpack/fish_${fishColor}_skeleton.png`;

        return `
            <div style="grid-template-columns: repeat(2, 1fr); display: grid; gap: 15px;">
                ${this.posts.map(p => `
                    <div class="post-item" data-pid="${p.id}" style="padding: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(0,242,255,0.3); border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <img src="${fishImg}" style="width: 25px; height: auto;">
                            <span style="font-weight: bold; color: #f3ff00; font-size: 13px;">@${profile.codename}</span>
                            ${this.completedPosts.has(p.id) ? '<span style="color: #00ff00; font-size: 12px;">[İNCELENDİ]</span>' : ''}
                        </div>
                        <p style="margin: 0; font-size: 14px;">${p.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    addEventListeners() {
        // Tab listeners
        document.getElementById('tab-settings').onclick = () => { this.currentTab = 'settings'; this.renderProfileUI(); };
        document.getElementById('tab-posts').onclick = () => { this.currentTab = 'posts'; this.renderProfileUI(); };

        // Settings listeners
        const optButtons = document.querySelectorAll('.privacy-opt');
        optButtons.forEach(btn => {
            btn.onclick = (e) => {
                const sId = parseInt(e.target.dataset.sid);
                const val = e.target.dataset.val;
                this.handleChoice(sId, val, e.target);
            };
        });

        // Post listeners
        const postItems = document.querySelectorAll('.post-item');
        postItems.forEach(item => {
            item.onclick = (e) => {
                const pId = parseInt(item.dataset.pid);
                if (this.completedPosts.has(pId)) return;
                this.showPostModal(pId);
            };
        });

        // Modal listeners
        document.getElementById('close-modal').onclick = () => { document.getElementById('post-modal').style.display = 'none'; };
    }

    showPostModal(pId) {
        const post = this.posts.find(p => p.id === pId);
        const modal = document.getElementById('post-modal');
        const text = document.getElementById('modal-post-text');
        
        text.innerText = post.text;
        modal.style.display = 'flex';

        document.getElementById('btn-share').onclick = () => this.handlePostDecision(pId, true);
        document.getElementById('btn-dont-share').onclick = () => this.handlePostDecision(pId, false);
    }

    handlePostDecision(pId, chosenToShare) {
        const post = this.posts.find(p => p.id === pId);
        const isCorrect = (chosenToShare === post.isSafe);
        const modal = document.getElementById('post-modal');
        
        if (isCorrect) {
            this.updateScore(100);
            this.sound.play('sfx_correct', { volume: 0.5 });
            this.completedPosts.add(pId);
        } else {
            this.updateScore(-50);
            this.sound.play('sfx_error', { volume: 0.5 });
            this.cameras.main.shake(200, 0.01);
            this.showGuideMessage("Bu paylaşım güvenli görünmüyor! Tekrar düşün.");
        }

        const container = document.getElementById('content-container');
        const scrollPos = container ? container.scrollTop : 0;

        modal.style.display = 'none';
        this.renderProfileUI();

        // Restore scroll position
        const newContainer = document.getElementById('content-container');
        if (newContainer) newContainer.scrollTop = scrollPos;

        this.checkWinCondition();
    }

    handleChoice(sId, val, element) {
        const setting = this.settings.find(s => s.id === sId);
        const isCorrect = (val === setting.correct);
        
        if (isCorrect) {
            element.style.background = '#00ff00';
            element.style.color = '#000';
            element.style.borderColor = '#00ff00';
            this.sound.play('sfx_correct', { volume: 0.4 });
            
            if (!this.completedSettings.has(sId)) {
                this.updateScore(100);
                this.completedSettings.add(sId);
            }
        } else {
            element.style.background = '#ff0000';
            element.style.color = '#fff';
            element.style.borderColor = '#ff0000';
            this.sound.play('sfx_error', { volume: 0.4 });
            this.updateScore(-20);
            this.cameras.main.shake(100, 0.005);
        }

        document.getElementById('ui-score').innerText = `PUAN: ${this.score}`;
        this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.completedSettings.size === this.settings.length && this.completedPosts.size === this.posts.length) {
            this.handleWin('privacy_pro');
        }
    }

    updateScore(amount) {
        this.score += amount;
        // Super class UI score is updated in handleWin and creation, 
        // we update our custom HTML element manually
    }

    handleWin(badgeId) {
        document.getElementById('ui-overlay').innerHTML = '';
        super.handleWin(badgeId);
    }

    showGuideMessage(text) {
        const bubble = document.getElementById('dom-guide-bubble');
        const content = document.getElementById('dom-guide-text');
        
        if (bubble && content) {
            content.innerText = text;
            bubble.style.display = 'block';
            bubble.style.opacity = '1';
            
            // Auto-hide after 6 seconds
            if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
            this.bubbleTimer = setTimeout(() => {
                if (bubble) bubble.style.display = 'none';
            }, 6000);
        }
    }
}
