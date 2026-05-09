import { MiniGameScene } from './MiniGameScene';

export class PhishingPuzzle extends MiniGameScene {
    constructor() {
        super('PhishingPuzzle');
    }

    create() {
        this.createBaseUI('Oltalama Avcısı');
        const { width, height } = this.cameras.main;

        this.showGuideMessage("Güvenli (HTTPS) bağlantısı olan balıkları yakala, şüpheli olanlardan kaç!");

        this.targetFishes = this.add.group();
        this.urls = [
            { text: 'https://e-devlet.gov.tr', isSafe: true },
            { text: 'https://meb.gov.tr', isSafe: true },
            { text: 'http://bedava-oyun.xyz', isSafe: false },
            { text: 'https://banka-onlayn.net', isSafe: false },
            { text: 'https://google.com', isSafe: true },
            { text: 'http://tikla-kazan.co', isSafe: false },
            { text: 'https://cyber-academy.edu', isSafe: true },
            { text: 'http://login-update.info', isSafe: false }
        ];

        // Player Setup (Using guideFish as the playable character)
        this.tweens.killTweensOf(this.guideFish); // Stop automatic bobbing
        this.physics.add.existing(this.guideFish);
        this.guideFish.setPosition(100, height / 2);
        this.guideFish.body.setCollideWorldBounds(true);
        this.guideFish.body.setSize(60, 40); // Tighter hit box
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        // Spawn Target Fishes
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: () => this.spawnFish(),
            loop: true
        });

        // Collision Logic
        this.physics.add.overlap(this.guideFish, this.targetFishes, (player, target) => {
            const data = target.getData('urlData');
            if (data.isSafe) {
                this.updateScore(100);
                this.showGuideMessage("Leziz ve güvenli!");
                target.destroy(); // Ensure it disappears
                
                if (this.score >= 1000) {
                    this.handleWin('phishing_hunter');
                }
            } else {
                this.updateScore(-50);
                this.showGuideMessage("ÖÖĞK! Bu çok şüpheli!");
                this.cameras.main.shake(250, 0.015);
                target.destroy(); // Ensure it disappears
            }
        });
    }

    spawnFish() {
        const { width, height } = this.cameras.main;
        const colors = ['blue', 'green', 'orange', 'red', 'pink', 'brown', 'grey'];
        const color = Phaser.Math.RND.pick(colors);
        
        const frameName = `fish_${color}`;
        const startY = Phaser.Math.Between(150, height - 150);
        
        // Use a Container for Fish + Speech Bubble
        const container = this.add.container(width + 100, startY);
        
        const fishSprite = this.add.sprite(0, 0, 'fish_atlas', frameName);
        fishSprite.setScale(1.2).setFlipX(true);
        
        const urlData = Phaser.Math.RND.pick(this.urls);
        
        // Create Speech Bubble Background
        const bubbleWidth = 180;
        const bubbleHeight = 40;
        const bubble = this.add.graphics();
        bubble.fillStyle(0xffffff, 1).lineStyle(2, urlData.isSafe ? 0x00ff00 : 0xff0000, 1);
        bubble.fillRoundedRect(-bubbleWidth/2, -bubbleHeight - 30, bubbleWidth, bubbleHeight, 10);
        bubble.strokeRoundedRect(-bubbleWidth/2, -bubbleHeight - 30, bubbleWidth, bubbleHeight, 10);
        
        // Triangle pointer
        bubble.fillTriangle(-10, -30, 10, -30, 0, -15);
        bubble.strokeTriangle(-10, -30, 10, -30, 0, -15);

        const label = this.add.text(0, -bubbleHeight - 10, urlData.text, {
            fontSize: '13px',
            fill: '#000000',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: bubbleWidth - 10 }
        }).setOrigin(0.5);

        container.add([fishSprite, bubble, label]);
        container.setData('urlData', urlData);
        container.setData('startY', startY);
        container.setData('sineTime', Phaser.Math.FloatBetween(0, 10)); // Randomized start phase

        this.physics.add.existing(container);
        container.body.setVelocityX(Phaser.Math.Between(-80, -140)); // Slower speed for readability
        container.body.setCircle(35, -35, -35); // Better hit box

        this.targetFishes.add(container);
    }

    update(time, delta) {
        super.update(time, delta); // Background parallax
        
        // Player Movement
        const speed = 450;
        const body = this.guideFish.body;
        if (!body) return;
        body.setVelocity(0);

        if (this.cursors.up.isDown || this.wasd.W.isDown) body.setVelocityY(-speed);
        else if (this.cursors.down.isDown || this.wasd.S.isDown) body.setVelocityY(speed);
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) body.setVelocityX(-speed);
        else if (this.cursors.right.isDown || this.wasd.D.isDown) body.setVelocityX(speed);

        // Target Fishes "S" (Sine Wave) Movement
        this.targetFishes.getChildren().forEach(fish => {
            if (fish.active) {
                const sineTime = (fish.getData('sineTime') || 0) + delta * 0.0012;
                fish.setData('sineTime', sineTime);
                
                // Vertical S-movement
                const amplitude = 50;
                fish.y = fish.getData('startY') + Math.sin(sineTime) * amplitude;

                // Auto-cleanup
                if (fish.x < -200) fish.destroy();
            }
        });
    }
}
