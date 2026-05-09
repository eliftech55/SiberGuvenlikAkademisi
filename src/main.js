import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CharacterCreationScene } from './scenes/CharacterCreationScene';
import { LoginScene } from './scenes/LoginScene';
import { HubScene } from './scenes/HubScene';
import { GraduationScene } from './scenes/GraduationScene';

// Mini-games
import { EmailSimulator } from './scenes/minigames/EmailSimulator';
import { PrivacyConfigurator } from './scenes/minigames/PrivacyConfigurator';
import { URLSurf } from './scenes/minigames/URLSurf';
import { PhishingPuzzle } from './scenes/minigames/PhishingPuzzle';
import { TreasurePassword } from './scenes/minigames/TreasurePassword';
import { SocialEng } from './scenes/minigames/SocialEng';
import { MalwareFirewall } from './scenes/minigames/MalwareFirewall';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: false
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    transparent: true,
    scene: [
        BootScene,
        CharacterCreationScene,
        LoginScene,
        HubScene,
        EmailSimulator,
        PrivacyConfigurator,
        URLSurf,
        PhishingPuzzle,
        TreasurePassword,
        SocialEng,
        MalwareFirewall,
        GraduationScene
    ]
};

import { uiService } from './services/uiService';

const game = new Phaser.Game(config);
window.phaserGame = game;

// Initialize Global UI
uiService.init();

// Global sound reference for UI slider
game.events.on('ready', () => {
    window.gameSoundManager = game.sound;
});

export default game;
