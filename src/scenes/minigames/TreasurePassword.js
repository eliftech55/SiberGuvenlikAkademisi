import { MiniGameScene } from './MiniGameScene';

export class TreasurePassword extends MiniGameScene {
    constructor() {
        super('TreasurePassword');
    }

    init() {
        super.init();
        this.usedPasswords = new Set();
    }

    create() {
        this.createBaseUI('Hazine Şifresi');
        const { width, height } = this.cameras.main;

        // Create a Dynamic Glow Texture (No more squares!)
        const glowGraphic = this.add.graphics();
        const glowSize = 128;
        for (let i = 0; i < 20; i++) {
            const alpha = 0.1 - (i * 0.005);
            glowGraphic.fillStyle(0x00f2ff, alpha);
            glowGraphic.fillCircle(glowSize/2, glowSize/2, (glowSize/2) * (1 - i/20));
        }
        glowGraphic.generateTexture('dynamic_glow', glowSize, glowSize);
        glowGraphic.destroy();

        this.showGuideMessage("Korsanlardan korunmak için sandıkları güçlü şifrelerle kilitle! Sandıklara tıkla.");

        this.chestsLocked = 0;
        this.totalChests = 5;

        // Chest Data (Items inside)
        const items = [
            { name: "Balığın Günlüğü", key: 'treasure_diary' },
            { name: "Gizli Harita", key: 'treasure_map' },
            { name: "İnci Kolye", key: 'treasure_necklace' },
            { name: "Altın Anahtar", key: 'treasure_key' },
            { name: "Özel Fotoğraflar", key: 'treasure_photos' }
        ];

        this.chests = this.add.group();

        // Create 5 chests balanced across the screen
        const spacing = width / (this.totalChests + 1);
        for (let i = 0; i < this.totalChests; i++) {
            const x = spacing * (i + 1);
            const y = height - 350;

            // 1. Flare GIF using DOM (Phaser doesn't natively play animated GIFs)
            const flare = this.add.dom(x, y - 10).createElement('div');
            flare.setClassName('flare-effect');
            flare.setHTML(`<img src="assets/flare.gif" style="width: 200px; height: 200px; opacity: 0.7; mix-blend-mode: screen;">`);
            flare.setDepth(-1);

            const chestContainer = this.add.container(x, y);
            
            // 2. Chest Visual (The user's PNG)
            const chestSprite = this.add.image(0, 0, 'chest_open').setScale(0.5);

            // 3. Item Visual (The user's provided PNGs)
            const itemSprite = this.add.image(0, -15, items[i].key).setScale(0.3);
            
            // 4. Custom Toggle DOM
            const toggleWrapper = this.add.dom(0, 75).createFromHTML(`
                <div class="toggle-wrapper">
                    <div class="toggle" id="toggle-${i}">
                        <div class="slide"></div>
                    </div>
                </div>
            `);

            chestContainer.add([chestSprite, itemSprite, toggleWrapper]);
            chestContainer.setSize(100, 100);
            chestContainer.setInteractive({ useHandCursor: true });
            
            // 5. Wavy Effect
            this.tweens.add({
                targets: [chestContainer, flare],
                y: '-=10',
                duration: 2000 + (i * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            chestContainer.on('pointerdown', () => {
                if (chestContainer.getData('locked')) return;
                this.openPasswordModal(chestContainer, items[i].name);
            });

            chestContainer.setData('item', items[i].name);
            chestContainer.setData('index', i);
            chestContainer.setData('locked', false);
            chestContainer.setData('sprite', chestSprite);
            chestContainer.setData('itemSprite', itemSprite);
            chestContainer.setData('flare', flare);
            
            this.chests.add(chestContainer);
        }

        if (this.guideFish) this.guideFish.setDepth(200);

        this.createModalUI();
    }

    createModalUI() {
        const modal = document.createElement('div');
        modal.id = 'password-modal';
        modal.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(10, 20, 40, 0.95); padding: 30px; border: 4px solid #00f2ff; 
                        border-radius: 20px; color: white; text-align: center; z-index: 10000;
                        min-width: 350px; font-family: 'Arial', sans-serif; box-shadow: 0 0 30px rgba(0, 242, 255, 0.3);">
                <h2 id="modal-item-name" style="color: #f3ff00; margin-bottom: 10px;">Hazine</h2>
                <p style="font-size: 14px; margin-bottom: 20px;">Korsanlardan korumak için GÜÇLÜ bir şifre belirle:</p>
                
                <input type="text" id="pass-input" placeholder="Şifrenizi yazın..." 
                       style="width: 100%; padding: 12px; border-radius: 8px; border: none; font-size: 18px; margin-bottom: 15px;">
                
                <div id="criteria-list" style="text-align: left; font-size: 13px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <div id="c-len" style="color: #ff4444;">❌ 8+ Hane</div>
                    <div id="c-upper" style="color: #ff4444;">❌ Büyük Harf</div>
                    <div id="c-lower" style="color: #ff4444;">❌ Küçük Harf</div>
                    <div id="c-num" style="color: #ff4444;">❌ Sayı</div>
                    <div id="c-spec" style="color: #ff4444;">❌ Özel Karakter</div>
                    <div id="c-repeat" style="color: #ff4444;">❌ Ardışık/Tekrar Yok</div>
                    <div id="c-date" style="color: #ff4444;">❌ Tarih/Yıl Yok</div>
                    <div id="c-unique" style="color: #ff4444;">❌ Benzersiz Şifre</div>
                </div>

                <button id="btn-lock-chest" disabled
                        style="background: #444; color: white; border: none; padding: 12px 30px; 
                               border-radius: 10px; font-weight: bold; cursor: not-allowed; transition: 0.3s;">
                    SANDIĞI KİLİTLE
                </button>
                <button id="btn-close-modal" style="background: none; border: 1px solid #666; color: #aaa; margin-left: 10px; cursor: pointer; padding: 10px;">İptal</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'none';

        const input = document.getElementById('pass-input');
        const btn = document.getElementById('btn-lock-chest');
        
        // STOP PHASER FROM STEALING WASD KEYS
        const stopProp = (e) => e.stopPropagation();
        input.addEventListener('keydown', stopProp);
        input.addEventListener('keyup', stopProp);
        input.addEventListener('keypress', stopProp);
        
        input.addEventListener('input', () => {
            const val = input.value;
            
            // Basic checks
            const checks = {
                len: val.length >= 8,
                upper: /[A-Z]/.test(val),
                lower: /[a-z]/.test(val),
                num: /[0-9]/.test(val),
                spec: /[!@#$%^&*(),.?":{}|<>]/.test(val),
                // Repeating/Sequential (aaa, abc, 123, 111)
                noRepeat: !/(.)\1\1/.test(val) && !this.isSequential(val),
                // Potential years (1900-2026)
                noDate: !/(19|20)\d{2}/.test(val),
                // Check if already used
                isUnique: !this.usedPasswords.has(val)
            };

            this.updateCriteria('c-len', checks.len);
            this.updateCriteria('c-upper', checks.upper);
            this.updateCriteria('c-lower', checks.lower);
            this.updateCriteria('c-num', checks.num);
            this.updateCriteria('c-spec', checks.spec);
            this.updateCriteria('c-repeat', checks.noRepeat);
            this.updateCriteria('c-date', checks.noDate);
            this.updateCriteria('c-unique', checks.isUnique);

            const allPassed = Object.values(checks).every(v => v);
            btn.disabled = !allPassed;
            btn.style.background = allPassed ? '#00c853' : '#444';
            btn.style.cursor = allPassed ? 'pointer' : 'not-allowed';
        });

        document.getElementById('btn-close-modal').onclick = () => {
            modal.style.display = 'none';
        };
    }

    isSequential(str) {
        const s = str.toLowerCase();
        for (let i = 0; i < s.length - 2; i++) {
            const a = s.charCodeAt(i);
            const b = s.charCodeAt(i + 1);
            const c = s.charCodeAt(i + 2);
            // 123 or abc
            if (b === a + 1 && c === b + 1) return true;
            // 321 or cba
            if (b === a - 1 && c === b - 1) return true;
        }
        return false;
    }

    updateCriteria(id, passed) {
        const el = document.getElementById(id);
        if (!el) return;
        const text = el.innerText.replace('✅', '').replace('❌', '').trim();
        el.style.color = passed ? '#00c853' : '#ff4444';
        el.innerText = (passed ? '✅ ' : '❌ ') + text;
    }

    resetModal() {
        const ids = ['c-len', 'c-upper', 'c-lower', 'c-num', 'c-spec', 'c-repeat', 'c-date', 'c-unique'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const text = el.innerText.replace('✅', '').replace('❌', '').trim();
                el.style.color = '#ff4444';
                el.innerText = '❌ ' + text;
            }
        });
        const btn = document.getElementById('btn-lock-chest');
        if (btn) {
            btn.disabled = true;
            btn.style.background = '#444';
        }
    }

    openPasswordModal(chest, itemName) {
        const modal = document.getElementById('password-modal');
        const input = document.getElementById('pass-input');
        const btn = document.getElementById('btn-lock-chest');
        
        this.resetModal(); // RESET EVERYTHING
        
        document.getElementById('modal-item-name').innerText = itemName;
        input.value = '';
        modal.style.display = 'block';
        input.focus();

        btn.onclick = () => {
            this.usedPasswords.add(input.value);
            modal.style.display = 'none';
            this.lockChest(chest);
        };
    }

    lockChest(chest) {
        chest.setData('locked', true);
        const sprite = chest.getData('sprite');
        const itemSprite = chest.getData('itemSprite');
        const flare = chest.getData('flare');
        const index = chest.getData('index');
        
        // Update Custom Toggle via DOM
        const toggleEl = document.getElementById(`toggle-${index}`);
        if (toggleEl) toggleEl.classList.add('on');

        // Hide item and flare
        if (itemSprite) itemSprite.setVisible(false);
        if (flare) {
            this.tweens.killTweensOf(flare);
            flare.setVisible(false);
        }

        // Change texture to closed
        sprite.setTexture('chest_closed');
        sprite.setScale(0.21);
        
        // Punch animation
        this.tweens.add({
            targets: sprite,
            scaleX: 0.23,
            scaleY: 0.23,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        this.chestsLocked++;
        this.updateScore(100);
        this.sound.play('sfx_correct');

        this.showGuideMessage(`Harika! ${chest.getData('item')} artık güvende.`);

        if (this.chestsLocked >= this.totalChests) {
            this.time.delayedCall(1500, () => {
                this.handleWin('password_warden');
            });
        }
    }

    shutdown() {
        const modal = document.getElementById('password-modal');
        if (modal) modal.remove();
    }
}
