import Phaser from 'phaser';
import { createProfile, checkCodenameUnique, loginWithCodename, getLocalProfile, getAllLocalAccounts } from '../services/authService';

export class CharacterCreationScene extends Phaser.Scene {
    constructor() {
        super('CharacterCreationScene');
        this.selectedColor = 'blue';
        this.selectedType = 'standard';
    }

    create() {
        // If user already has a profile, jump straight to Hub
        const existing = getLocalProfile();
        if (existing && existing.codename) {
            this.scene.start('HubScene');
            return;
        }

        const { width, height } = this.cameras.main;

        this.bgMain = this.add.image(width / 2, height / 2, 'bg_main').setDisplaySize(width, height);
        this.bgCliffs = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_cliffs');
        this.bgCliffs.setAlpha(0.6).setScale(1.2);

        this.createBubbles(width, height);
        this.createSeaweed(width, height);

        const previewX = width * 0.7;
        const previewY = height / 2;
        
        this.glow = this.add.circle(previewX, previewY, 150, 0x00f2ff, 0.2);
        this.tweens.add({ targets: this.glow, scale: 1.15, alpha: 0.3, duration: 2000, yoyo: true, loop: -1 });
        
        this.fishPreview = this.add.sprite(previewX, previewY, 'fish_atlas', 'fish_blue');
        this.fishPreview.setScale(3);
        
        this.tweens.add({ targets: this.fishPreview, y: previewY - 30, duration: 2500, ease: 'Sine.easeInOut', yoyo: true, loop: -1 });

        this.setupUI();
    }

    createSeaweed(width, height) {
        this.seaweedGroup = this.add.group();
        const frames = ['background_seaweed_a', 'background_seaweed_b', 'background_seaweed_c'];
        for (let i = 0; i < 6; i++) {
            let sw = this.add.image(Phaser.Math.Between(0, width), height - 60, 'fish_atlas', Phaser.Math.RND.pick(frames));
            sw.setAlpha(0.5).setScale(Phaser.Math.FloatBetween(2, 3)).setDepth(1);
            this.seaweedGroup.add(sw);
        }
    }

    createBubbles(width, height) {
        this.time.addEvent({
            delay: 600,
            callback: () => {
                const x = Phaser.Math.Between(0, width);
                const bubble = this.add.image(x, height + 50, 'fish_atlas', 'bubble_a');
                bubble.setScale(Phaser.Math.FloatBetween(0.3, 0.6)).setAlpha(0.4);
                this.tweens.add({ targets: bubble, y: -100, x: x + Phaser.Math.Between(-50, 50), duration: Phaser.Math.Between(6000, 10000), onComplete: () => bubble.destroy() });
            },
            loop: true
        });
    }

    setupUI() {
        const overlay = document.getElementById('ui-overlay');
        const localAccounts = getAllLocalAccounts();

        const accountsHtml = localAccounts.length > 0 ? `
            <div style="margin-top: 10px; padding: 10px; background: rgba(0, 242, 255, 0.05); border-radius: 8px; border: 1px dashed rgba(0, 242, 255, 0.3);">
                <div style="font-size: 11px; color: #00f2ff; margin-bottom: 5px;">KAYITLI HESAPLAR:</div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${localAccounts.map(a => `
                        <button class="saved-acc-btn" data-name="${a.codename}" style="background: rgba(0,0,0,0.5); border: 1px solid #f3ff00; color: #f3ff00; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
                            ${a.codename} (${a.xp || 0} XP)
                        </button>
                    `).join('')}
                </div>
            </div>
        ` : '';

        overlay.innerHTML = `
            <div class="hud-panel" style="position: absolute; top: 50%; left: 10%; transform: translateY(-50%); width: 390px; padding: 35px; background: rgba(0, 15, 30, 0.95); border: 3px solid #00f2ff; border-radius: 20px; color: white; box-shadow: 0 0 30px rgba(0, 242, 255, 0.3);">
                <h1 style="margin-top: 0; color: #f3ff00; text-transform: uppercase; letter-spacing: 3px; border-bottom: 2px solid #00f2ff; padding-bottom: 15px; font-size: 26px;">KARAKTER OLUŞTUR</h1>
                
                <div style="margin: 15px 0;">
                    <label for="char-name" style="display: block; margin-bottom: 5px; font-weight: bold; color: #00f2ff;">KOD ADI:</label>
                    <input type="text" id="char-name" class="cyber-input" style="width: 100%; padding: 12px; background: #001a33; border: 2px solid #00f2ff; color: white; border-radius: 8px; font-size: 18px;" placeholder="Adınızı yazın..." maxlength="15">
                    <button id="btn-check" style="margin-top: 8px; padding: 6px 12px; background: none; border: 1px solid #00f2ff; color: #00f2ff; cursor: pointer; font-size: 12px; border-radius: 4px;">MEVCUT HESABI YÜKLE</button>
                    ${accountsHtml}
                </div>

                <div id="customization-area">
                    <div style="margin: 15px 0;">
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #00f2ff;">RENK SEÇİMİ:</label>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${['blue', 'green', 'orange', 'red', 'pink', 'brown', 'grey'].map(c => 
                                `<div class="color-btn" data-color="${c}" style="width: 35px; height: 35px; border-radius: 50%; background: ${c}; cursor: pointer; border: 3px solid transparent; transition: all 0.2s;"></div>`
                            ).join('')}
                        </div>
                    </div>

                    <div style="margin: 15px 0;">
                        <label for="char-type" style="display: block; margin-bottom: 10px; font-weight: bold; color: #00f2ff;">BALIK TÜRÜ:</label>
                        <select id="char-type" class="cyber-input" style="width: 100%; padding: 10px; background: #001a33; border: 2px solid #00f2ff; color: white; border-radius: 8px; cursor: pointer;">
                            <option value="standard">Standart</option>
                            <option value="skeleton">İskelet</option>
                        </select>
                    </div>
                </div>

                <button id="btn-save" class="cyber-button" style="width: 100%; padding: 14px; background: #f3ff00; color: #001a33; border: none; font-weight: bold; font-size: 18px; border-radius: 10px; cursor: pointer; margin-top: 10px;">GÖREVİ BAŞLAT</button>
                <div id="status-msg" style="margin-top: 10px; text-align: center; font-size: 13px; color: #f3ff00;"></div>
            </div>
        `;

        this.updateColorSelection();

        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.onclick = () => {
                this.selectedColor = btn.dataset.color;
                this.updateColorSelection();
                this.updatePreview();
            };
        });

        document.getElementById('char-type').onchange = (e) => {
            this.selectedType = e.target.value;
            this.updatePreview();
        };

        const charNameInput = document.getElementById('char-name');
        if (charNameInput) {
            const stopProp = (e) => e.stopPropagation();
            charNameInput.addEventListener('keydown', stopProp);
            charNameInput.addEventListener('keyup', stopProp);
            charNameInput.addEventListener('keypress', stopProp);
        }

        // Click on a saved account tag
        document.querySelectorAll('.saved-acc-btn').forEach(btn => {
            btn.onclick = () => {
                const nameInput = document.getElementById('char-name');
                if (nameInput) {
                    nameInput.value = btn.dataset.name;
                    document.getElementById('btn-check').click();
                }
            };
        });

        // Existing Account Login
        document.getElementById('btn-check').onclick = async () => {
            const name = document.getElementById('char-name').value.trim();
            if (!name) { alert('Lütfen kod adınızı girin!'); return; }
            
            const msg = document.getElementById('status-msg');
            msg.innerText = 'Kontrol ediliyor...';
            
            const profile = await loginWithCodename(name);
            if (profile) {
                msg.style.color = '#00ff00';
                msg.innerText = 'Hesap yüklendi! Kampüse geçiliyor...';
                this.time.delayedCall(800, () => {
                    overlay.innerHTML = '';
                    this.scene.start('HubScene');
                });
            } else {
                msg.style.color = '#ff6666';
                msg.innerText = 'Hesap bulunamadı. Yeni karakter oluşturabilirsiniz.';
            }
        };

        // Create New Profile
        document.getElementById('btn-save').onclick = async () => {
            const name = document.getElementById('char-name').value.trim();
            if (!name) { alert('Lütfen bir kod adı giriniz!'); return; }
            
            const isUnique = await checkCodenameUnique(name);
            if (!isUnique) {
                alert('Bu kod adı zaten alınmış! Lütfen başka bir ad seçin veya mevcut hesabı yükleyin.');
                return;
            }

            const profileData = { color: this.selectedColor, type: this.selectedType };
            overlay.innerHTML = '<div class="hud-panel" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #f3ff00; font-size: 22px; font-weight: bold;">AKADEMİYE GİRİLİYOR...</div>';
            
            const profile = await createProfile(name, 'fish', profileData);
            if (profile) {
                overlay.innerHTML = '';
                this.scene.start('HubScene');
            }
        };
    }

    updateColorSelection() {
        document.querySelectorAll('.color-btn').forEach(btn => {
            if (btn.dataset.color === this.selectedColor) {
                btn.style.borderColor = 'white';
                btn.style.transform = 'scale(1.2)';
            } else {
                btn.style.borderColor = 'transparent';
                btn.style.transform = 'scale(1)';
            }
        });
    }

    updatePreview() {
        let frameName = `fish_${this.selectedColor}`;
        const colorsWithSkeletons = ['blue', 'green', 'orange', 'pink', 'red'];
        if (this.selectedType === 'skeleton' && colorsWithSkeletons.includes(this.selectedColor)) {
            frameName = `fish_${this.selectedColor}_skeleton`;
        }
        if (this.fishPreview) this.fishPreview.setFrame(frameName);
    }

    update() {
        this.bgCliffs.tilePositionX += 0.3;
        this.seaweedGroup.getChildren().forEach(sw => { sw.x -= 0.15; if (sw.x < -150) sw.x = 1174; });
    }
}
