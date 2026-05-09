import Phaser from 'phaser';
import { getLocalProfile, awardBadge, completeGame } from '../../services/authService';
import { uiService } from '../../services/uiService';

export class MiniGameScene extends Phaser.Scene {
    constructor(key) {
        super(key);
        this.gameId = key.toLowerCase();
        this.activeBubble = null;
    }

    init() {
        this.score = 0;
        this.isGameOver = false;
        uiService.setCurrentScene(this.scene.key);
        uiService.updateHeader();
    }

    createBaseUI(title) {
        const { width, height } = this.cameras.main;
        const profile = getLocalProfile();
        const fishData = profile?.metaData || { color: 'blue', type: 'standard' };
        
        // 1. Parallax Background Layers (Matching HubScene)
        this.bgMain = this.add.image(width / 2, height / 2, 'bg_main').setDisplaySize(width, height);
        this.bgCliffs = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_cliffs');
        this.bgCliffs.setAlpha(0.5).setScale(1.2).setDepth(0);
        
        this.createSeaweed(width, height);
        this.createBubbles(width, height);

        const SAFE_TOP = 70; // Header is 60px
        
        // 2. Header (Minimal background for Phaser text overlay if needed)
        this.add.rectangle(0, 0, width, 60, 0x1a1a2e, 0.4).setOrigin(0).setDepth(100);
        
        // 3. Score (Positioned below global header)
        this.scoreText = this.add.text(width - 20, SAFE_TOP + 20, 'PUAN: 0', {
            fontSize: '22px', fill: '#f3ff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
        }).setOrigin(1, 0.5).setDepth(101);

        // 4. Fish Guide (As requested)
        const colorsWithSkeletons = ['blue', 'green', 'orange', 'pink', 'red'];
        let frameName = `fish_${fishData.color}`;
        if (fishData.type === 'skeleton' && colorsWithSkeletons.includes(fishData.color)) {
            frameName = `fish_${fishData.color}_skeleton`;
        }

        this.guideFish = this.add.sprite(100, height - 100, 'fish_atlas', frameName);
        this.guideFish.setScale(1.5).setDepth(100);
        this.tweens.add({
            targets: this.guideFish,
            y: height - 120,
            duration: 2000,
            yoyo: true,
            loop: -1
        });

        // 4. Fish Guide (As requested)
    }

    createBubbles(width, height) {
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                const x = Phaser.Math.Between(0, width);
                const bubble = this.add.image(x, height + 50, 'fish_atlas', 'bubble_a');
                bubble.setScale(Phaser.Math.FloatBetween(0.2, 0.5)).setAlpha(0.3).setDepth(1);
                this.tweens.add({ targets: bubble, y: -100, x: x + Phaser.Math.Between(-50, 50), duration: Phaser.Math.Between(6000, 10000), onComplete: () => bubble.destroy() });
            },
            loop: true
        });
    }

    createSeaweed(width, height) {
        this.seaweedGroup = this.add.group();
        const frames = ['background_seaweed_a', 'background_seaweed_b', 'background_seaweed_c'];
        for (let i = 0; i < 6; i++) {
            let sw = this.add.image(Phaser.Math.Between(0, width), height - 80, 'fish_atlas', Phaser.Math.RND.pick(frames));
            sw.setAlpha(0.4).setScale(Phaser.Math.FloatBetween(2, 3)).setDepth(2);
            this.seaweedGroup.add(sw);
        }
    }

    showGuideMessage(text) {
        if (this.activeBubble) this.activeBubble.destroy();
        this.sound.play('sfx_bubble', { volume: 0.6 });

        const bubbleWidth = 250;
        const bubbleHeight = 80;
        const { width } = this.cameras.main;

        // Calculate horizontal position - keep it on screen
        let bx = this.guideFish.x - bubbleWidth / 2;
        if (bx < 10) bx = 10;
        if (bx + bubbleWidth > width - 10) bx = width - bubbleWidth - 10;

        const by = this.guideFish.y - 120;

        this.activeBubble = this.add.container(bx, by);
        this.activeBubble.setDepth(105);

        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1).lineStyle(3, 0x00f2ff, 1);
        graphics.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10);
        graphics.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10);
        
        // Triangle pointing down to guide fish
        // Find local X of fish relative to container
        const localFishX = this.guideFish.x - bx;
        graphics.fillTriangle(localFishX - 10, bubbleHeight, localFishX + 10, bubbleHeight, localFishX, bubbleHeight + 15);
        graphics.strokeTriangle(localFishX - 10, bubbleHeight, localFishX + 10, bubbleHeight, localFishX, bubbleHeight + 15);

        const content = this.add.text(bubbleWidth / 2, bubbleHeight / 2, text, {
            fontSize: '15px', color: '#000000', align: 'center', fontStyle: 'bold', wordWrap: { width: bubbleWidth - 20 }
        }).setOrigin(0.5);

        this.activeBubble.add([graphics, content]);

        this.time.delayedCall(5000, () => {
            if (this.activeBubble) {
                this.tweens.add({ targets: this.activeBubble, alpha: 0, duration: 500, onComplete: () => this.activeBubble?.destroy() });
            }
        });
    }

    update() {
        if (this.bgCliffs) {
            this.bgCliffs.tilePositionX += 0.3;
        }
        
        if (this.seaweedGroup) {
            this.seaweedGroup.getChildren().forEach(sw => { 
                sw.x -= 0.15; 
                if (sw.x < -200) sw.x = 1480; 
            });
        }

        // If guide bubble exists, keep it slightly above the guide fish in case of animation
        if (this.activeBubble && this.guideFish) {
            this.activeBubble.y = this.guideFish.y - 140;
            this.activeBubble.x = this.guideFish.x - 125; // Keep bubble centered horizontally
        }
    }

    updateScore(amount) {
        this.score += amount;
        if (amount > 0) this.sound.play('sfx_correct', { volume: 0.5 });
        else this.sound.play('sfx_error', { volume: 0.5 });
        
        if (this.scoreText) this.scoreText.setText(`PUAN: ${this.score}`);
    }

    async handleWin(badgeId) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.sound.play('sfx_correct', { volume: 0.8 });

        const { width, height } = this.cameras.main;
        // Subtle overlay instead of solid black
        this.add.rectangle(0, height / 2 - 100, width, 200, 0x001528, 0.6).setOrigin(0, 0.5).setDepth(200);
        
        this.add.text(width / 2, height / 2 - 50, 'GÖREV TAMAMLANDI!', { fontSize: '48px', fill: '#00f2ff', fontStyle: 'bold', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5).setDepth(201);

        await completeGame(this.scene.key, this.score);
        if (badgeId) {
            await awardBadge(badgeId);
            const badgeNames = {
                'email_expert': 'E-posta Uzmanı',
                'privacy_pro': 'Gizlilik Ustası',
                'url_inspector': 'URL Müfettişi',
                'phishing_hunter': 'Oltalama Avcısı',
                'password_warden': 'Şifre Muhafızı',
                'social_engineer': 'Sosyal Dedektif',
                'firewall_guardian': 'Güvenlik Duvarı Koruyucusu'
            };
            const displayBadge = badgeNames[badgeId] || badgeId.toUpperCase();
            this.add.text(width / 2, height / 2 + 20, `YENİ ROZET: ${displayBadge}`, { fontSize: '24px', fill: '#f3ff00' }).setOrigin(0.5).setDepth(201);
        }

        this.time.delayedCall(3000, () => this.scene.start('HubScene'));
    }
}
