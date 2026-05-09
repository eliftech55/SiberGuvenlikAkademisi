import Phaser from 'phaser';
import { createProfile, checkCodenameUnique, getLocalProfile } from '../services/authService';

export class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    create() {
        // If already has profile, skip to Hub
        const profile = getLocalProfile();

        // Start background music if not already playing
        if (!this.sound.getAllPlaying().find(s => s.key === 'bg_ocean')) {
            this.sound.play('bg_ocean', { 
                loop: true, 
                volume: localStorage.getItem('caq_volume') !== null ? parseFloat(localStorage.getItem('caq_volume')) : 0.3 
            });
        }

        if (profile) {
            this.scene.start('HubScene');
            return;
        }

        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a12).setOrigin(0);
        
        // Title
        this.add.text(width / 2, height / 4, 'SİBER GÜVENLİK AKADEMİSİ', {
            fontSize: '48px',
            fill: '#00f2ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 4 + 60, 'Hoş geldin Aday. Profilini oluştur.', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // UI Overlay for inputs
        const overlay = document.getElementById('ui-overlay');
        overlay.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;" class="hud-panel">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px;">KOD ADI:</label>
                    <input type="text" id="codename-input" class="cyber-input" placeholder="Kod adı giriniz..." maxlength="12">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px;">AVATAR:</label>
                    <button id="btn-male" class="cyber-button" style="padding: 10px;">ERKEK</button>
                    <button id="btn-female" class="cyber-button" style="padding: 10px;">KADIN</button>
                </div>
                <button id="btn-start" class="cyber-button" style="width: 100%;">BAŞLAT</button>
                <div id="login-error" style="color: #ff00ff; margin-top: 10px; font-size: 12px;"></div>
            </div>
        `;

        let selectedAvatar = 'male';
        
        document.getElementById('btn-male').onclick = () => {
            selectedAvatar = 'male';
            document.getElementById('btn-male').style.borderColor = '#f3ff00';
            document.getElementById('btn-female').style.borderColor = '#00f2ff';
        };

        document.getElementById('btn-female').onclick = () => {
            selectedAvatar = 'female';
            document.getElementById('btn-female').style.borderColor = '#f3ff00';
            document.getElementById('btn-male').style.borderColor = '#00f2ff';
        };

        document.getElementById('btn-start').onclick = async () => {
            const codename = document.getElementById('codename-input').value.trim();
            const errorDiv = document.getElementById('login-error');

            if (!codename) {
                errorDiv.innerText = 'KOD ADI GEREKLİ';
                return;
            }

            const isUnique = await checkCodenameUnique(codename);
            if (!isUnique) {
                errorDiv.innerText = 'BU KOD ADI ZATEN ALINMIŞ';
                return;
            }

            errorDiv.innerText = 'EŞİTLENİYOR...';
            const profile = await createProfile(codename, selectedAvatar);
            
            if (profile) {
                overlay.innerHTML = '';
                this.scene.start('HubScene');
            }
        };
    }
}
