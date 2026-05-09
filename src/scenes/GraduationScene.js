import Phaser from 'phaser';

export class GraduationScene extends Phaser.Scene {
    constructor() {
        super('GraduationScene');
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.add.rectangle(0, 0, width, height, 0x0a0a12).setOrigin(0);
        
        this.add.text(width / 2, height / 3, 'GRADUATION DAY', {
            fontSize: '64px',
            fill: '#f3ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, 'CONGRATULATIONS, CYBER GUARDIAN!\nYou have mastered all cybersecurity skills.', {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const btn = this.add.rectangle(width / 2, height - 100, 300, 60, 0x00f2ff).setInteractive();
        this.add.text(width / 2, height - 100, 'VIEW CERTIFICATE', { color: '#000', fontWeight: 'bold' }).setOrigin(0.5);
        
        btn.on('pointerdown', () => {
            alert('Certificate: Licensed Cyber Guardian');
        });
    }
}
