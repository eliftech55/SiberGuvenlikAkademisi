import { getLocalProfile, logout, getLeaderboard, updateMetaData } from './authService.js';

class UIService {
    constructor() {
        this.currentScene = null;
        this.isInstructionsOpen = false;
        this.isProfileOpen = false;
        
        // 7 Mini-Game Instructions - Audited from Code
        this.instructions = {
            'HubScene': {
                title: 'Akademi Kampüsü',
                body: `
                    <p>Siber Güvenlik Akademisi'ne hoş geldin! Kampüste özgürce dolaşabilir ve eğitimlere katılabilirsin.</p>
                    <ul>
                        <li><b>Hareket:</b> Yön (Ok) tuşlarını kullanarak yüz.</li>
                        <li><b>Eğitimler:</b> Su altındaki parlayan yemlere (Mini Oyunlar) dokunarak görevleri başlat.</li>
                    </ul>
                `
            },
            'MalwareFirewall': {
                title: 'Zararlı Yazılım Temizliği',
                body: `
                    <p>Okyanusu istila eden zararlı dosyaları süpürgenle temizle!</p>
                    <ul>
                        <li><b>Kontrol:</b> Farenin ucuyla balığı yönlendir.</li>
                        <li><b>Süpürme:</b> Sol tık veya "Boşluk" tuşu ile vakumu çalıştır.</li>
                        <li><b>Hedef:</b> Zararlı dosyaları (.exe, .bat, .scr, .zip) vakumla.</li>
                        <li><b>Dikkat:</b> Güvenli dosyaları vakumlarsan veya zararlıların kaçmasına izin verirsen puan kaybedersin.</li>
                    </ul>
                `
            },
            'SocialEng': {
                title: 'Sosyal Mühendislik Analizi',
                body: `
                    <p>Telefona gelen mesajlardaki gizli tuzakları tespit et.</p>
                    <ul>
                        <li><b>Analiz:</b> Mesajın içeriğini ve gönderen kişiyi dikkatlice oku.</li>
                        <li><b>Karar:</b> Mesaj şüpheliyse "ŞÜPHELİ", güvenliyse "GÜVENİLİR" butonuna bas.</li>
                        <li><b>Puanlama:</b> Her doğru analiz 50 XP kazandırır.</li>
                    </ul>
                `
            },
            'TreasurePassword': {
                title: 'Hazine Şifresi',
                body: `
                    <p>Hazine sandıklarını kırılamaz şifrelerle koru!</p>
                    <ul>
                        <li><b>Kilit:</b> Sandıklara tıkla ve şifre belirle.</li>
                        <li><b>Güçlü Şifre:</b> Şifren 8 karakterden uzun olmalı; büyük harf, küçük harf, rakam ve özel karakter içermelidir.</li>
                        <li><b>Kural:</b> Ardışık sayılar/harfler (123, abc) ve daha önce kullandığın şifreleri kullanamazsın!</li>
                    </ul>
                `
            },
            'URLSurf': {
                title: 'URL Sörf Oyunu',
                body: `
                    <p>Zararlı URL balıklarını avla, güvenli olanları koru!</p>
                    <ul>
                        <li><b>Kırmızı Balıklar:</b> Zararlı sitelerdir. "Boşluk" tuşuyla lazer fırlatarak onları temizle.</li>
                        <li><b>Yeşil Balıklar:</b> Güvenli sitelerdir. Onlara ateş etme, serbestçe yüzmelerine izin ver.</li>
                        <li><b>Hareket:</b> Yön (Ok) veya W,A,S,D tuşlarını kullanarak hareket et.</li>
                        <li><b>Uyarı:</b> Canını korumak için balıklara çarpmamaya dikkat et.</li>
                    </ul>
                `
            },
            'EmailSimulator': {
                title: 'E-posta Simülatörü',
                body: `
                    <p>Gelen kutundaki siber saldırıları durdur!</p>
                    <ul>
                        <li><b>İnceleme:</b> E-postaları açarak gönderen adresini ve içeriği kontrol et.</li>
                        <li><b>Linkler:</b> Linklerin üzerine fareyle gelerek nereye gittiklerini kontrol et.</li>
                        <li><b>Karar:</b> Şüpheli e-postaları "GÜVENLİ DEĞİL", güvenli olanları "GÜVENLİ" olarak işaretle.</li>
                    </ul>
                `
            },
            'PhishingPuzzle': {
                title: 'Oltalama Avcısı',
                body: `
                    <p>Siber okyanustaki güvenli kaynakları topla, oltalama tuzaklarından kaç!</p>
                    <ul>
                        <li><b>Güvenli Balıklar (HTTPS):</b> Üzerinde güvenli bağlantı (HTTPS) olan balıklar temiz kaynaklardır. Onlara dokunarak puan topla.</li>
                        <li><b>Tehlikeli Balıklar (HTTP/Sahte):</b> Sahte veya güvensiz bağlantı içeren balıklardan uzak dur!</li>
                        <li><b>Hareket:</b> Yön (Ok) veya W,A,S,D tuşlarını kullanarak her yöne hareket et.</li>
                    </ul>
                `
            },
            'PrivacyConfigurator': {
                title: 'Gizlilik Yapılandırıcı',
                body: `
                    <p>Profilini ve paylaşımlarını güvenli hale getir.</p>
                    <ul>
                        <li><b>Ayarlar:</b> "GİZLİLİK AYARLARI" sekmesinde en güvenli seçenekleri işaretle.</li>
                        <li><b>Paylaşımlar:</b> "PAYLAŞIMLARIM" sekmesinde tehlikeli olabilecek mesajları paylaşmayı reddet.</li>
                        <li><b>Hedef:</b> Tüm alanları tamamlayarak siber koruyucu rozeti kazan.</li>
                    </ul>
                `
            }
        };
    }

    init() {
        console.log("UIService: Global UI Initialized");
        this.setupEventListeners();
        this.updateHeader();
    }

    setCurrentScene(sceneKey) {
        this.currentScene = sceneKey;
        const backBtn = document.getElementById('btn-back-to-campus');
        if (backBtn) {
            const menuScenes = ['HubScene', 'LoginScene', 'CharacterCreationScene'];
            backBtn.style.display = menuScenes.includes(sceneKey) ? 'none' : 'block';
        }

        const profileTrigger = document.getElementById('profile-trigger');
        if (profileTrigger) {
            profileTrigger.classList.remove('disabled');
            profileTrigger.style.cursor = 'pointer';
        }
    }

    updateHeader() {
        const profile = getLocalProfile();
        if (!profile) return;
        
        const codenameEls = [document.getElementById('header-codename'), document.getElementById('prof-codename')];
        const xpEls = [document.getElementById('header-xp'), document.getElementById('prof-xp')];
        
        codenameEls.forEach(el => { if (el) el.innerText = profile.codename; });
        xpEls.forEach(el => { if (el) el.innerText = profile.xp || 0; });

        this.renderColorPicker(profile?.metaData?.color || 'blue');
        this.updateTypeButtons(profile?.metaData?.type || 'standard');
    }

    renderColorPicker(activeColor) {
        const grid = document.getElementById('color-picker-grid');
        if (!grid) return;
        const colors = ['blue', 'green', 'orange', 'pink', 'red', 'brown', 'grey'];
        grid.innerHTML = colors.map(c => `
            <div class="color-circle ${c === activeColor ? 'active' : ''}" 
                 data-color="${c}" 
                 style="background: ${c};"></div>
        `).join('');

        // Add listeners
        grid.querySelectorAll('.color-circle').forEach(el => {
            el.onclick = () => {
                const color = el.getAttribute('data-color');
                updateMetaData({ color });
                this.updateHeader();
                window.dispatchEvent(new CustomEvent('fish-updated'));
            };
        });
    }

    updateTypeButtons(activeType) {
        document.querySelectorAll('.fish-type-btn').forEach(btn => {
            if (btn.getAttribute('data-type') === activeType) {
                btn.style.background = 'var(--cyber-blue)';
                btn.style.color = 'black';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--cyber-blue)';
            }
            btn.onclick = () => {
                const type = btn.getAttribute('data-type');
                updateMetaData({ type });
                this.updateHeader();
                window.dispatchEvent(new CustomEvent('fish-updated'));
            };
        });
    }

    setupEventListeners() {
        // Back to Campus
        const backBtn = document.getElementById('btn-back-to-campus');
        if (backBtn) {
            backBtn.onclick = (e) => {
                e.preventDefault();
                
                // 1. Clear any DOM overlays (critical for DOM games)
                const overlay = document.getElementById('ui-overlay');
                if (overlay) {
                    overlay.innerHTML = '';
                    overlay.style.pointerEvents = 'none';
                }

                // 2. Clear detail modals if any
                const detailOverlay = document.getElementById('email-detail-overlay');
                if (detailOverlay) detailOverlay.remove();

                const passModal = document.getElementById('password-modal');
                if (passModal) passModal.remove();

                // 3. Resume and reset state
                this.isInstructionsOpen = false;
                this.isProfileOpen = false;
                this.toggleGamePause(false);

                // 4. Switch Scene
                if (window.phaserGame) {
                    const active = window.phaserGame.scene.getScenes(true);
                    if (active.length > 0) {
                        active[0].scene.start('HubScene');
                    }
                }
            };
        }

        // Proper Logout Handler
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                if (confirm("Oturumu kapatıp karakter seçim ekranına dönmek istediğinize emin misiniz?")) {
                    logout();
                    // Clear UI overlay
                    const overlay = document.getElementById('ui-overlay');
                    if (overlay) overlay.innerHTML = '';
                    window.location.reload();
                }
            };
        }

        const btnHowTo = document.getElementById('btn-how-to-play');
        if (btnHowTo) {
            btnHowTo.onclick = () => this.showInstructions();
        }

        const instModal = document.getElementById('instruction-modal');
        document.querySelectorAll('#instruction-modal .close-modal, #instruction-modal .close-btn-footer').forEach(btn => {
            btn.onclick = () => {
                instModal.style.display = 'none';
                this.isInstructionsOpen = false;
                this.toggleGamePause(false);
            };
        });

        // Global Profile Trigger
        const profileTrigger = document.getElementById('profile-trigger');
        if (profileTrigger) {
            profileTrigger.onclick = () => this.showProfile();
        }

        // Profile Modal Close
        const profModal = document.getElementById('profile-modal');
        document.querySelectorAll('.close-profile-modal').forEach(btn => {
            btn.onclick = () => {
                profModal.style.display = 'none';
                this.isProfileOpen = false;
                this.toggleGamePause(false);
            };
        });

        const volSlider = document.getElementById('vol-slider');
        if (volSlider) {
            volSlider.oninput = (e) => {
                const vol = parseFloat(e.target.value);
                if (window.gameSoundManager) window.gameSoundManager.setVolume(vol);
                localStorage.setItem('caq_volume', vol);
            };
        }
    }

    async showProfile() {
        const modal = document.getElementById('profile-modal');
        if (!modal) return;
        
        this.updateHeader();
        modal.style.display = 'flex';
        this.isProfileOpen = true;
        this.toggleGamePause(true);

        const lbBox = document.getElementById('leaderboard-list-box');
        if (lbBox) {
            const leaders = await getLeaderboard();
            if (leaders && leaders.length > 0) {
                lbBox.innerHTML = leaders.map((l, i) => `
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid rgba(0,242,255,0.1); ${i<3 ? 'color: #f3ff00; font-weight: bold;' : ''}">
                        <span>${i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : (i + 1) + '. '}${l.codename}</span>
                        <span>${l.xp || 0} XP</span>
                    </div>
                `).join('');
            } else {
                lbBox.innerHTML = '<div style="text-align: center; color: #888; padding: 15px;">Lider tablosu henüz oluşmadı.</div>';
            }
        }
    }

    showInstructions() {
        const modal = document.getElementById('instruction-modal');
        const titleEl = document.getElementById('inst-title');
        const bodyEl = document.getElementById('inst-body');
        const info = this.instructions[this.currentScene] || this.instructions['HubScene'];
        
        if (titleEl) titleEl.innerText = info.title;
        if (bodyEl) bodyEl.innerHTML = info.body;
        
        if (modal) {
            modal.style.display = 'flex';
            this.isInstructionsOpen = true;
            this.toggleGamePause(true);
        }
    }

    toggleGamePause(pause) {
        if (!window.phaserGame) return;
        try {
            const allScenes = window.phaserGame.scene.scenes;
            allScenes.forEach(s => {
                if (pause) {
                    if (s.scene.isActive()) {
                        s.scene.pause();
                        if (s.physics) s.physics.pause();
                        if (s.sound) s.sound.pauseAll();
                    }
                } else {
                    if (s.scene.isPaused()) {
                        s.scene.resume();
                        if (s.physics) s.physics.resume();
                        if (s.sound) s.sound.resumeAll();
                    }
                }
            });
        } catch (err) {
            console.error("UIService Global Pause Error:", err);
        }
    }
}

export const uiService = new UIService();
