import { MiniGameScene } from './MiniGameScene';

export class SocialEng extends MiniGameScene {
    constructor() {
        super('SocialEng');
        this.messages = [
            { text: "Tebrikler! Yılın en şanslı balığı seçildin. 5000 yosun altını kazanmak için ev adresini ve kimlik numaranı hemen gönder.", sender: "Bilinmeyen Numara", isSuspicious: true },
            { text: "Merhaba Siber Balık! Yarınki mBlock kodlama atölyemizde görüşmek üzere. Malzemelerini unutma. - Öğretmenin", sender: "Öğretmenin", isSuspicious: false },
            { text: "Dikkat! Okyanus polisinden mesaj. Hakkınızda şikayet var. İfade vermek için hemen şifrenizle giriş yapıp aşağıdaki formu doldurun!", sender: "Kurnaz Tilki Balığı", isSuspicious: true },
            { text: "Selam! Canik Ekofest için hazırladığımız projeyi bitirdim. Dosyayı güvenli okul ağımıza yükledim, oradan inceleyebilirsin. - Arkadaşın Yunus", sender: "Arkadaşın Yunus", isSuspicious: false },
            { text: "Ben BİLSEM müdürü. Sisteme giriş yapamıyorum, acil olarak e-posta şifreni benimle paylaşır mısın?", sender: "Sahtekâr Yengeç", isSuspicious: true },
            { text: "Yeni nesil yüzgeç güçlendirici bedava! Sadece bugün için geçerli bu fırsatı kaçırma. Kredi kartı bilgilerini gir, hemen yollayalım.", sender: "Bilinmeyen Link", isSuspicious: true },
            { text: "Merhaba, Yeşil Vatan çevre koruma kulübümüzün haftalık toplantısı bugün saat 15:00'te başlayacak. Gecikme! - Deniz Kaplumbağası", sender: "Deniz Kaplumbağası", isSuspicious: false },
            { text: "İnternet kotanız doldu! Ekstra 10 GB deniz altı interneti için 'EVET' yazıp tüm rehberinle bu mesajı paylaş.", sender: "Bilinmeyen Numara", isSuspicious: true },
            { text: "Çok acil! Yolda kaldım ve cüzdanımı kaybettim. Lütfen bu hesaba hemen 500 midye gönder, yarın ödeyeceğim. - En Yakın Arkadaşın(!)", sender: "Taklitçi Ahtapot", isSuspicious: true },
            { text: "Siber Balık, Arduino devresinde yanan ledlerin kodlarında ufak bir hata buldum, yarın laboratuvarda birlikte düzeltelim mi? - Mert", sender: "Mert", isSuspicious: false },
            { text: "Merhaba, ben bir yarışma programından ulaşıyorum. Büyük ödülü kazandın ama önce dosya masrafı olarak banka şifreni göndermen lazım.", sender: "Kurnaz Tilki Balığı", isSuspicious: true },
            { text: "eTwinning projesi 'Escape Room' için hazırladığımız bulmacaları sisteme yükledim. Şifre falan istemiyor, direkt ortak klasörden bakabilirsin. - Proje Ortağın", sender: "Proje Ortağın", isSuspicious: false },
            { text: "Cihazına virüs bulaştı! Hemen bu bağlantıya tıklayıp temizleme programını indirmezsen tüm fotoğrafların silinecek!", sender: "Sahte Uyarı", isSuspicious: true },
            { text: "Bugün okulda anlattığın 'sürdürülebilir kalkınma' sunumu harikaydı, notlarını yarın benimle de paylaşır mısın? - Zeynep", sender: "Zeynep", isSuspicious: false },
            { text: "Selam, kankanım ben. Yeni numaram bu. Eski numarayı sil. Bana hemen okul sisteminin şifresini yazar mısın, ders notlarına bakmam lazım.", sender: "Taklitçi Ahtapot", isSuspicious: true },
            { text: "Hafta sonu kütüphanede buluşup sıradaki Zeka Oyunları Turnuvası için antrenman yapmaya ne dersin? - Takım Kaptanı", sender: "Takım Kaptanı", isSuspicious: false },
            { text: "Oyun hesabın süresiz kapatılacak! Engeli kaldırmak için kullanıcı adı ve parolanı hemen aşağıdaki linke tıkla ve doğrula.", sender: "Sahte Sistem Mesajı", isSuspicious: true },
            { text: "Sosyal medya profilini kimlerin gizlice gezdiğini görmek ister misin? Bu uygulamayı indir ve hesap bilgilerinle giriş yap!", sender: "Reklam Mesajı", isSuspicious: true },
            { text: "Ödevinle ilgili gönderdiğin dosyayı aldım Siber Balık. Kaynakçanı çok iyi hazırlamışsın, tebrik ederim. - Öğretmenin", sender: "Öğretmenin", isSuspicious: false },
            { text: "İnanılmaz kampanya! Yalnızca ilk tıklayan 10 balığa sınırsız oyun pakedi hediye! Linke tıkla ve hemen şifreni oluştur.", sender: "Kurnaz Tilki Balığı", isSuspicious: true }
        ];
        this.currentMessageIndex = 0;
        this.correctAnswers = 0;
    }

    preload() {
        this.load.image('phone_final', 'assets/phone.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        
        const phoneH = 700;
        const phoneW = (627 / 1012) * phoneH;
        const scale = phoneH / 1012;

        this.createBaseUI('Sosyal Mühendislik Analizi');
        if (this.bgCliffs) {
            this.bgCliffs.setVisible(true).setAlpha(0.4).setDepth(0);
        }

        this.phone = this.add.image(width/2, height/2 + 40, 'phone_final').setDisplaySize(phoneW, phoneH).setDepth(1);

        this.screenW = phoneW * 0.8118;
        this.screenH = phoneH * 0.6097;
        
        const phoneLeft = (width / 2) - (phoneW / 2);
        const phoneTop = this.phone.y - (phoneH / 2);
        
        const screenX = phoneLeft + (phoneW * 0.1100);
        const screenY = phoneTop + (phoneH * 0.1897);

        const screenBg = this.add.graphics();
        screenBg.fillStyle(0x0a0a0a, 1);
        screenBg.fillRoundedRect(screenX, screenY, this.screenW, this.screenH, 15);
        screenBg.setDepth(2);
        
        this.messageContainer = this.add.container(screenX + this.screenW/2, screenY + this.screenH/2);
        this.messageContainer.setDepth(3);
        
        const maskShape = this.add.graphics();
        maskShape.fillRoundedRect(screenX, screenY, this.screenW, this.screenH, 15);
        this.messageContainer.setMask(maskShape.createGeometryMask());

        this.showNextMessage();
        this.createControls(width, height);

        this.showGuideMessage("Siber Balık'ın telefonuna gelen mesajları incele. Şüpheli mi yoksa Güvenilir mi?");
        if (this.guideFish) this.guideFish.setDepth(1000);
    }

    showNextMessage() {
        if (this.currentMessageIndex >= this.messages.length) {
            this.handleWin('social_engineer');
            return;
        }

        const msg = this.messages[this.currentMessageIndex];
        this.messageContainer.removeAll(true);

        const senderText = this.add.text(0, -this.screenH/2 + 40, msg.sender, {
            fontSize: '18px', fill: '#00f2ff', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);

        const bubble = this.add.graphics();
        bubble.fillStyle(0xe8f1f5, 0.95);
        bubble.fillRoundedRect(-this.screenW/2 + 10, -100, this.screenW - 20, 200, 15);
        bubble.lineStyle(2, 0x3498db, 0.5);
        bubble.strokeRoundedRect(-this.screenW/2 + 10, -100, this.screenW - 20, 200, 15);

        const text = this.add.text(0, 0, msg.text, {
            fontSize: '16px', fill: '#2c3e50', align: 'center', wordWrap: { width: this.screenW - 40 }
        }).setOrigin(0.5);

        this.messageContainer.add([senderText, bubble, text]);

        this.messageContainer.setAlpha(0);
        this.sound.play('sfx_message', { volume: 0.6 });
        
        if (this.phone) {
            this.tweens.add({
                targets: this.phone,
                x: (this.cameras.main.width / 2) + 3,
                duration: 50,
                yoyo: true,
                repeat: 3
            });
        }

        this.tweens.add({
            targets: this.messageContainer,
            alpha: 1,
            duration: 500
        });
    }

    createControls(width, height) {
        const btnY = this.phone.y + (this.screenH / 2) - 10;
        const btnW = 130;
        
        const suspiciousBtn = this.add.container(width / 2 - 80, btnY);
        const sBg = this.add.graphics();
        sBg.fillStyle(0xff4444, 1);
        sBg.fillRoundedRect(-btnW/2, -20, btnW, 40, 8);
        const sText = this.add.text(0, 0, 'ŞÜPHELİ', { fontSize: '14px', fontStyle: 'bold', fill: '#fff' }).setOrigin(0.5);
        suspiciousBtn.add([sBg, sText]);
        suspiciousBtn.setSize(btnW, 40);
        suspiciousBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.handleChoice(true));
        suspiciousBtn.setDepth(15);

        const safeBtn = this.add.container(width / 2 + 80, btnY);
        const gBg = this.add.graphics();
        gBg.fillStyle(0x00c853, 1);
        gBg.fillRoundedRect(-btnW/2, -20, btnW, 40, 8);
        const gText = this.add.text(0, 0, 'GÜVENİLİR', { fontSize: '14px', fontStyle: 'bold', fill: '#fff' }).setOrigin(0.5);
        safeBtn.add([gBg, gText]);
        safeBtn.setSize(btnW, 40);
        safeBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.handleChoice(false));
        safeBtn.setDepth(15);
    }

    handleChoice(choiceIsSuspicious) {
        const msg = this.messages[this.currentMessageIndex];
        const isCorrect = choiceIsSuspicious === msg.isSuspicious;

        if (isCorrect) {
            this.correctAnswers++;
            this.updateScore(50);
            this.sound.play('sfx_level_up', { volume: 0.6 });
            this.showGuideMessage("HARİKA! DOĞRU ANALİZ.");
            this.currentMessageIndex++;
            this.time.delayedCall(1500, () => this.showNextMessage());
        } else {
            this.updateScore(-25);
            this.sound.play('sfx_error');
            this.showGuideMessage("DİKKAT! BU BİR TUZAK OLABİLİR.");
            this.cameras.main.shake(200, 0.01);
        }
    }
}
