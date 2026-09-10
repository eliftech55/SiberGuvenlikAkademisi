import Phaser from 'phaser';
import { getLocalProfile } from '../services/authService';
import { uiService } from '../services/uiService';

export class HubScene extends Phaser.Scene {
    constructor() {
        super('HubScene');
        this.activeBubble = null;
    }

    create() {
        // Start background music if not already playing
        if (!this.sound.getAllPlaying().find(s => s.key === 'bg_ocean')) {
            this.sound.play('bg_ocean', { 
                loop: true, 
                volume: localStorage.getItem('caq_volume') !== null ? parseFloat(localStorage.getItem('caq_volume')) : 0.3 
            });
        }

        const { width, height } = this.cameras.main;
        const profile = getLocalProfile();
        const fishData = profile?.metaData || { color: 'blue', type: 'standard' };

        // 1. Backgrounds
        this.bgMain = this.add.image(width / 2, height / 2, 'bg_main').setDisplaySize(width, height);
        this.bgCliffs = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_cliffs');
        this.bgCliffs.setAlpha(0.6).setScale(1.2).setDepth(0);

        this.createSeaweed(width, height);
        this.createBubbles(width, height);

        // 2. Player Fish
        this.player = this.physics.add.sprite(width / 2, 240, 'fish_atlas', this.getFishFrame(fishData));
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1.5);
        this.player.setDrag(1000);
        this.player.setDepth(10);

        // 3. Mini-Games
        this.baitGroup = this.physics.add.group();
        this.createBaits(profile);

        // 4. Collision
        this.physics.add.overlap(this.player, this.baitGroup, (player, bait) => {
            const sceneKey = bait.getData('scene');
            this.scene.start(sceneKey);
        });

        // 5. Speech Bubble
        this.createSpeechBubble("Yön tuşları ile beni yönlendirerek bir oyun seçebilirsin.");

        // 6. Global UI Integration
        uiService.setCurrentScene(this.scene.key);
        uiService.updateHeader();
        
        // Listen for global fish updates
        window.addEventListener('fish-updated', () => this.updatePlayerSprite());

        // 7. Controls (Arrow keys + WASD)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D', true, false);

        this.add.text(width / 2, 90, 'SİBER GÜVENLİK AKADEMİSİ', {
            fontSize: '40px', fill: '#f3ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(20);
    }

    getFishFrame(fishData) {
        const colorsWithSkeletons = ['blue', 'green', 'orange', 'pink', 'red', 'brown', 'grey'];
        let frameName = `fish_${fishData.color || 'blue'}`;
        if (fishData.type === 'skeleton' && colorsWithSkeletons.includes(fishData.color)) {
            frameName = `fish_${fishData.color}_skeleton`;
        }
        return frameName;
    }

    updatePlayerSprite() {
        const profile = getLocalProfile();
        if (this.player && profile?.metaData) {
            this.player.setFrame(this.getFishFrame(profile.metaData));
        }
    }

    createSpeechBubble(text) {
        if (this.activeBubble) {
            this.activeBubble.destroy();
            this.activeBubble = null;
        }

        const bubbleX = this.player ? this.player.x : 640;
        const bubbleY = this.player ? this.player.y - 100 : 150;

        this.activeBubble = this.add.dom(bubbleX, bubbleY).createFromHTML(`
            <div class="tooltip">${text}</div>
        `);
        this.activeBubble.setDepth(200);

        this.time.delayedCall(8000, () => {
            if (this.activeBubble) {
                this.tweens.add({
                    targets: this.activeBubble,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.activeBubble) {
                            this.activeBubble.destroy();
                            this.activeBubble = null;
                        }
                    }
                });
            }
        });
    }

    createBaits(profile) {
        const { width } = this.cameras.main;
        const skills = this.cache.json.get('skills');
        const spacing = (width - 300) / (skills.rooms.length - 1);

        skills.rooms.forEach((room, index) => {
            const isCompleted = profile?.completedGames?.includes(room.scene);
            const x = 150 + (index * spacing);
            const targetY = Phaser.Math.Between(400, 650);

            const line = this.add.graphics();
            line.lineStyle(3, isCompleted ? 0x666666 : 0xffffff, isCompleted ? 0.3 : 0.6);
            line.lineBetween(x, 0, x, targetY);

            const baitContainer = this.add.container(x, targetY);
            const glow = this.add.circle(0, 0, 60, isCompleted ? 0x666666 : 0xf3ff00, 0.2);
            const hook = this.add.circle(0, 0, 18, isCompleted ? 0x666666 : 0xf3ff00).setStrokeStyle(3, 0xffffff);
            const title = this.add.text(0, 55, isCompleted ? 'TAMAMLANDI' : room.name.toUpperCase(), {
                fontSize: '14px', fill: isCompleted ? '#888888' : '#f3ff00', fontStyle: 'bold',
                backgroundColor: 'rgba(0,10,20,0.95)', padding: { x: 12, y: 8 }, align: 'center',
                wordWrap: { width: 140 }, stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);

            baitContainer.add([glow, hook, title]);
            if (!isCompleted) {
                this.physics.world.enable(baitContainer);
                baitContainer.setData('scene', room.scene);
                this.baitGroup.add(baitContainer);
            } else {
                baitContainer.setAlpha(0.5);
            }

            this.tweens.add({
                targets: [baitContainer, line],
                y: '+=20', duration: 2000 + Math.random() * 1000, ease: 'Sine.easeInOut', yoyo: true, loop: -1
            });
        });
    }

    createSeaweed(width, height) {
        this.seaweedGroup = this.add.group();
        const frames = ['background_seaweed_a', 'background_seaweed_b', 'background_seaweed_c'];
        for (let i = 0; i < 8; i++) {
            let sw = this.add.image(Phaser.Math.Between(0, width), height - 80, 'fish_atlas', Phaser.Math.RND.pick(frames));
            sw.setAlpha(0.4).setScale(Phaser.Math.FloatBetween(2, 3.5)).setDepth(2);
            this.seaweedGroup.add(sw);
        }
    }

    createBubbles(width, height) {
        this.time.addEvent({
            delay: 400,
            callback: () => {
                const x = Phaser.Math.Between(0, width);
                const bubble = this.add.image(x, height + 50, 'fish_atlas', 'bubble_a');
                bubble.setScale(Phaser.Math.FloatBetween(0.3, 0.8)).setAlpha(0.4).setDepth(1);
                this.tweens.add({ targets: bubble, y: -100, x: x + Phaser.Math.Between(-60, 60), duration: Phaser.Math.Between(5000, 10000), onComplete: () => bubble.destroy() });
            },
            loop: true
        });
    }

    update(time, delta) {
        const speed = 350;
        const body = this.player.body;
        if (!body) return;
        body.setVelocity(0);

        let isMoving = false;
        if (this.cursors.left.isDown || this.wasd?.A?.isDown) { body.setVelocityX(-speed); this.player.setFlipX(true); isMoving = true; }
        else if (this.cursors.right.isDown || this.wasd?.D?.isDown) { body.setVelocityX(speed); this.player.setFlipX(false); isMoving = true; }

        if (this.cursors.up.isDown || this.wasd?.W?.isDown) { body.setVelocityY(-speed); isMoving = true; }
        else if (this.cursors.down.isDown || this.wasd?.S?.isDown) { body.setVelocityY(speed); isMoving = true; }

        if (isMoving && (!this.lastMoveSoundTime || time - this.lastMoveSoundTime > 400)) {
            this.sound.play('sfx_swim', { volume: 0.25 });
            this.lastMoveSoundTime = time;
        }

        if (this.activeBubble && this.player) {
            this.activeBubble.x = Phaser.Math.Clamp(this.player.x, 170, 1110);
            this.activeBubble.y = Math.max(140, this.player.y - 100);
        }

        this.bgCliffs.tilePositionX += 0.4;
        this.seaweedGroup.getChildren().forEach(sw => { sw.x -= 0.2; if (sw.x < -200) sw.x = 1224; });
    }
}
