import { MiniGameScene } from './MiniGameScene';
export class FakeUrlSurf extends MiniGameScene {
    constructor() { super('FakeUrlSurf'); }
    create() {
        this.createBaseUI('URL Sörf Oyunu');
        this.showGuideMessage("Sadece GÜVENLİ (HTTPS) olan sitelere tıkla!");
        this.add.text(512, 384, 'Sadece HTTPS sitelerine tıklayın.', { fontSize: '20px' }).setOrigin(0.5);
        this.add.rectangle(512, 500, 200, 50, 0x00f2ff).setInteractive().on('pointerdown', () => {
            this.updateScore(500);
            this.handleWin('url_inspector');
        });
    }
}
