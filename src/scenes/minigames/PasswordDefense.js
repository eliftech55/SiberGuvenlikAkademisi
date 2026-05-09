import { MiniGameScene } from './MiniGameScene';
export class PasswordDefense extends MiniGameScene {
    constructor() { super('PasswordDefense'); }
    create() {
        this.createBaseUI('Şifre Kalesi');
        this.showGuideMessage("Güçlü şifreler oluşturarak kaleni koru!");
        this.add.text(512, 384, 'Güçlü şifreler oluşturun.', { fontSize: '20px' }).setOrigin(0.5);
        this.add.rectangle(512, 500, 200, 50, 0x00f2ff).setInteractive().on('pointerdown', () => {
            this.updateScore(500);
            this.handleWin('password_warden');
        });
    }
}
