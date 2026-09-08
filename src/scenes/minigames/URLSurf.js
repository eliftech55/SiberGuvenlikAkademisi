import { MiniGameScene } from './MiniGameScene';

export class URLSurf extends MiniGameScene {
    constructor() {
        super('URLSurf');
    }

    create() {
        this.createBaseUI('URL Sörfü');
        const { width, height } = this.cameras.main;

        // Reset and Prep Guide Fish
        this.tweens.killTweensOf(this.guideFish);
        this.physics.add.existing(this.guideFish);
        this.guideFish.setPosition(150, height / 2);
        this.guideFish.body.setAllowGravity(false);
        this.guideFish.setDepth(2000);

        // Physics World Bounds (Accounting for Top Header)
        this.physics.world.setBounds(0, 75, width, height - 75);
        this.guideFish.body.setCollideWorldBounds(true);

        this.showGuideMessage("Zararlı URL'leri lazerinle vur! Boşluk (Space) ile ateş et.");

        // Level & Stats
        this.lives = 3;
        this.currentLevel = 1;
        this.badUrlsHit = 0;
        this.totalBadNeeded = 5;
        this.score = 0;
        this.isGameOver = false;
        this.lastFired = 0;

        // UI (Shifted down to avoid header)
        this.levelText = this.add.text(width / 2, 110, 'SEVİYE: 1', { fontSize: '24px', fill: '#00f2ff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2100);
        this.progressText = this.add.text(width / 2, 140, `Hedef: 0/${this.totalBadNeeded} Zararlı URL`, { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5).setDepth(2100);
        this.livesText = this.add.text(width - 220, 120, 'CAN: ❤️❤️❤️', { fontSize: '22px', fill: '#ff0000', fontStyle: 'bold' }).setDepth(2100);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Groups
        this.urlGroup = this.physics.add.group();
        this.laserGroup = this.physics.add.group();

        // Global Collisions
        this.physics.add.overlap(this.laserGroup, this.urlGroup, (laser, target) => this.handleHit(laser, target));
        this.physics.add.overlap(this.guideFish, this.urlGroup, (player, target) => this.handlePlayerCollision(target));

        // Spawner
        this.spawnEvent = this.time.addEvent({
            delay: 1800,
            callback: () => this.spawnTarget(),
            loop: true
        });

        this.urlTemplates = [
            { text: 'https://e-devlet.gov.tr', safe: true },
            { text: 'https://meb.gov.tr', safe: true },
            { text: 'https://okul.edu.tr', safe: true },
            { text: 'https://e-okul.meb.gov.tr', safe: true },
            { text: 'http://bedava-oyun.xyz', safe: false },
            { text: 'https://banka-onlayn.ru', safe: false },
            { text: 'oyun-indir.exe', safe: false },
            { text: 'bit.ly/bedava-hediye', safe: false },
            { text: 'http://bedava-roblox.tk', safe: false },
            { text: 'tinyurl.com/sana-ozel-hediye', safe: false }
        ];
    }

    spawnTarget() {
        if (this.isGameOver) return;
        const { width, height } = this.cameras.main;
        const data = Phaser.Math.RND.pick(this.urlTemplates);
        const y = Phaser.Math.Between(120, height - 120);

        const container = this.add.container(width + 200, y);
        container.setDepth(1000);
        container.isSafeUrl = data.safe; // Use direct property for reliability

        const colors = ['blue', 'green', 'orange', 'red', 'pink'];
        const fish = this.add.sprite(0, 0, 'fish_atlas', `fish_${Phaser.Math.RND.pick(colors)}`);
        fish.setFlipX(true).setScale(1.3);

        const bubbleWidth = 240;
        const bubbleHeight = 45;
        const bubble = this.add.rectangle(0, -65, bubbleWidth, bubbleHeight, 0xffffff, 1);
        bubble.setStrokeStyle(6, data.safe ? 0x00ff00 : 0xff0000);
        
        const text = this.add.text(0, -65, data.text, { fontSize: '14px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
        container.add([fish, bubble, text]);

        this.physics.add.existing(container);
        container.body.setAllowGravity(false);
        // Circle body is much more reliable for overlap detection
        container.body.setCircle(70, -70, -70); 
        
        const duration = 7000 / (this.currentLevel * 0.8);
        
        this.tweens.add({
            targets: container,
            x: -300,
            duration: duration,
            onComplete: () => {
                if (container && container.active) {
                    if (container.isSafeUrl === false && !this.isGameOver) {
                        this.updateScore(-25);
                        this.showGuideMessage("Eyvah! Zararlı bir site siber okyanusa sızdı!");
                    } else if (container.isSafeUrl === true && !this.isGameOver) {
                        this.updateScore(10);
                    }
                    container.destroy();
                }
            }
        });

        this.urlGroup.add(container);
    }

    handleHit(laser, target) {
        if (this.isGameOver || !target.active || !target.list) return;
        
        // Find the bubble (Rectangle) in the container to check its color
        const bubble = target.list.find(child => child.strokeColor !== undefined);
        const isSafe = bubble && bubble.strokeColor === 0x00ff00; // Green stroke means SAFE
        
        laser.destroy();
        
        console.log(`URL Hit - Bubble Color: ${bubble?.strokeColor === 0x00ff00 ? 'GREEN' : 'RED'}`);

        if (isSafe) {
            // Penalty for hitting safe URLs (Green)
            this.updateScore(-60);
            this.takeDamage();
            this.showFloatingText(target.x, target.y, "-60", "#ff0000");
            this.showGuideMessage("Hayır olamaz! O güvenilir bir siteydi!");
        } else {
            // Reward for hitting bad URLs (Red)
            this.updateScore(37);
            this.badUrlsHit++;
            this.showFloatingText(target.x, target.y, "+37", "#00ff00");
            this.progressText.setText(`Hedef: ${this.badUrlsHit}/${this.totalBadNeeded} Zararlı URL`);
            this.sound.play('sfx_correct', { volume: 0.4 });
            
            if (this.badUrlsHit >= this.totalBadNeeded) {
                this.nextLevel();
            }
        }
        target.destroy();
    }

    showFloatingText(x, y, text, color) {
        const ft = this.add.text(x, y, text, { fontSize: '24px', fill: color, fontStyle: 'bold' }).setDepth(2500);
        this.tweens.add({
            targets: ft,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => ft.destroy()
        });
    }

    nextLevel() {
        if (this.currentLevel >= 3) {
            this.handleWin('url_inspector');
            return;
        }

        const { width, height } = this.cameras.main;
        this.currentLevel++;
        this.badUrlsHit = 0;
        this.levelText.setText(`SEVİYE: ${this.currentLevel}`);
        this.progressText.setText(`Hedef: 0/${this.totalBadNeeded} Zararlı URL`);
        
        // Visual Feedback for Level Up
        const levelUp = this.add.text(width / 2, height / 2, `SEVİYE ${this.currentLevel} BAŞLIYOR!`, {
            fontSize: '48px', fill: '#f3ff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(2500);
        
        this.tweens.add({ targets: levelUp, alpha: 0, scale: 2, duration: 2000, onComplete: () => levelUp.destroy() });
        this.sound.play('sfx_bubble', { volume: 0.8 });

        // Speed up spawn rate
        this.spawnEvent.delay = 1800 / (this.currentLevel * 0.9);
    }

    fireLaser() {
        if (this.isGameOver) return;
        // Thicker and larger laser for better hit detection
        const laser = this.add.rectangle(this.guideFish.x + 50, this.guideFish.y, 60, 12, 0x00f2ff);
        laser.setDepth(2001);
        this.physics.add.existing(laser);
        this.laserGroup.add(laser);
        if (laser.body) {
            laser.body.setAllowGravity(false);
            laser.body.setVelocityX(1600); // Faster laser
        }
        this.sound.play('sfx_click', { volume: 0.3 });
    }

    handlePlayerCollision(target) {
        target.destroy();
        this.takeDamage();
        this.showGuideMessage("Dikkat et! Balığa çarptın!");
    }

    takeDamage() {
        this.lives--;
        this.cameras.main.shake(200, 0.01);
        this.sound.play('sfx_error', { volume: 0.5 });
        let hearts = '';
        for (let i = 0; i < 3; i++) hearts += (i < this.lives) ? '❤️' : '🖤';
        this.livesText.setText(`CAN: ${hearts}`);
        if (this.lives <= 0) this.gameOver();
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        const { width, height } = this.cameras.main;
        this.add.text(width / 2, height / 2, 'OYUN BİTTİ!', { fontSize: '64px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3000);
        this.time.delayedCall(2500, () => this.scene.start('HubScene'));
    }

    update(time, delta) {
        super.update(time, delta);
        if (this.isGameOver) return;

        const body = this.guideFish.body;
        if (body) {
            body.setVelocity(0);
            const speed = 450;
            let isMoving = false;
            
            if (this.cursors.up.isDown || this.wasd.W.isDown) { body.setVelocityY(-speed); isMoving = true; }
            else if (this.cursors.down.isDown || this.wasd.S.isDown) { body.setVelocityY(speed); isMoving = true; }
            
            if (this.cursors.left.isDown || this.wasd.A.isDown) { body.setVelocityX(-speed); isMoving = true; }
            else if (this.cursors.right.isDown || this.wasd.D.isDown) { body.setVelocityX(speed); isMoving = true; }

            // Movement sound
            if (isMoving && (!this.lastMoveSoundTime || time - this.lastMoveSoundTime > 400)) {
                this.sound.play('sfx_swim', { volume: 0.2 });
                this.lastMoveSoundTime = time;
            }
        }

        if (this.spaceBar.isDown && time > this.lastFired) {
            this.fireLaser();
            this.lastFired = time + 250;
        }

        this.laserGroup.getChildren().forEach(l => {
            if (l.x > this.cameras.main.width + 100) l.destroy();
        });
    }
}
