import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width/4, height/2 - 25, width/2, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Yükleniyor...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00f2ff, 1);
            progressBar.fillRect(width/4 + 10, height/2 - 15, (width/2 - 20) * value, 30);
        });

        // Configs
        this.load.json('badges', 'config/badges.json');
        this.load.json('skills', 'config/skills.json');

        // Assets
        this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');

        // Fish Pack Assets (Atlas)
        this.load.atlasXML('fish_atlas', 'assets/fishpack/fish_spritesheet.png', 'assets/fishpack/fish_spritesheet.xml');

        this.load.image('bg_main', 'assets/fishpack/bg_main.png');
        this.load.image('bg_cliffs', 'assets/fishpack/bg_cliffs.png');
        this.load.image('bg_rock', 'assets/fishpack/background_rock_a.png');
        this.load.image('bg_seaweed', 'assets/fishpack/background_seaweed_a.png');
        this.load.image('bg_terrain', 'assets/fishpack/background_terrain.png');
        this.load.image('bubble', 'assets/fishpack/bubble_a.png');
        this.load.image('vacuum', 'assets/supurge.png');
        this.load.image('toz', 'assets/toz.png');
        this.load.image('chest_open', 'assets/chest_open.png');
        this.load.image('chest_closed', 'assets/chest_closed.png');
        this.load.image('phone_final', 'assets/phone.png');
        this.load.image('social_bg', 'assets/social_bg.png');
        this.load.image('flare_glow', 'assets/flare_glow.png');
        this.load.image('treasure_key', 'assets/treasure_key.png');
        this.load.image('treasure_photos', 'assets/treasure_photos.png');
        this.load.image('treasure_diary', 'assets/treasure_diary.png');
        this.load.image('treasure_map', 'assets/treasure_map.png');
        this.load.image('treasure_necklace', 'assets/treasure_necklace.png');

        // Sounds
        this.load.audio('sfx_click', 'assets/sounds/click.ogg');
        this.load.audio('sfx_correct', 'assets/sounds/correct.ogg');
        this.load.audio('sfx_error', 'assets/sounds/error.ogg');
        this.load.audio('sfx_select', 'assets/sounds/select.ogg');
        this.load.audio('sfx_bubble', 'assets/sounds/bubble.ogg');
        this.load.audio('sfx_move', 'assets/sounds/move.ogg');
        this.load.audio('sfx_swim', 'assets/sounds/swim.mp3');
        this.load.audio('bg_ocean', 'assets/sounds/ocean.mp3');
        this.load.audio('sfx_message', 'assets/sounds/message.mp3');
        this.load.audio('sfx_sent_message', 'assets/sounds/sent-message.mp3');
        this.load.audio('sfx_level_up', 'assets/sounds/level-up.mp3');
    }

    create() {
        // Resume audio context on first interaction
        this.input.once('pointerdown', () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });
        this.scene.start('CharacterCreationScene');
    }
}
