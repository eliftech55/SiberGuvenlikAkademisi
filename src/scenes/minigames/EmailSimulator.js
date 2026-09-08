import { MiniGameScene } from './MiniGameScene';

export class EmailSimulator extends MiniGameScene {
    constructor() {
        super('EmailSimulator');
    }

    init() {
        super.init();
        this.currentPhase = 1; // 1: Creation, 2: Inbox
        this.emails = [];
        this.processedCount = 0;
        this.targetCount = 10;
        this.userEmail = '';
    }

    create() {
        this.createBaseUI('Güvenli E-posta Simülatörü');
        const { width, height } = this.cameras.main;

        if (this.currentPhase === 1) {
            this.showCreationPhase();
        } else {
            this.showInboxPhase();
        }
    }

    showCreationPhase() {
        this.showGuideMessage("Selam! Önce kendine güvenli bir e-posta adresi oluşturmalısın. Geçerli bir adres yaz!");

        const overlay = document.getElementById('ui-overlay');
        overlay.style.pointerEvents = 'all';
        overlay.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; padding: 40px; background: rgba(0, 15, 30, 0.95); border: 3px solid #00f2ff; border-radius: 20px; color: white; text-align: center;">
                <h2 style="color: #f3ff00;">E-POSTA OLUŞTUR</h2>
                <p style="font-size: 14px; margin-bottom: 20px;">Akademi sistemine giriş için kurumsal bir e-posta adresi belirle.</p>
                <input type="text" id="email-input" placeholder="ornek@akademi.edu.tr" style="width: 100%; padding: 12px; background: #001a33; border: 2px solid #00f2ff; color: white; border-radius: 8px; font-size: 16px; margin-bottom: 20px;">
                <button id="btn-create-email" class="cyber-button" style="width: 100%; padding: 15px; background: #00f2ff; color: #000; font-weight: bold; border: none; border-radius: 10px; cursor: pointer;">HESABI OLUŞTUR</button>
                <div id="email-error" style="color: #ff4444; margin-top: 10px; font-size: 12px;"></div>
            </div>
        `;

        const emailInput = document.getElementById('email-input');
        emailInput.focus();

        document.getElementById('btn-create-email').onclick = () => {
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailRegex.test(email)) {
                this.userEmail = email;
                this.currentPhase = 2;
                this.showInboxPhase();
            } else {
                document.getElementById('email-error').innerText = 'Lütfen geçerli bir e-posta adresi giriniz!';
            }
        };
    }

    showInboxPhase() {
        this.showGuideMessage(`Hoş geldin! Gelen kutusundaki e-postaları incele. Şüpheli olanları "GÜVENLİ DEĞİL" olarak işaretle!`);

        if (this.emails.length === 0) {
            this.emails = this.generateEmails();
        }

        const overlay = document.getElementById('ui-overlay');
        overlay.style.pointerEvents = 'all';
        overlay.innerHTML = `
            <div id="email-app" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 900px; height: 600px; background: rgba(0, 10, 20, 0.98); border: 2px solid #00f2ff; border-radius: 15px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 40px rgba(0, 242, 255, 0.2);">
                <!-- Header -->
                <div style="background: rgba(0, 242, 255, 0.1); padding: 15px 25px; border-bottom: 1px solid #00f2ff; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">📬</span>
                        <span style="font-weight: bold; color: #00f2ff;">GELEN KUTUSU (${this.userEmail})</span>
                    </div>
                    <div style="font-size: 14px; color: #f3ff00; font-weight: bold;">SKOR: ${this.score} | İNCELENEN: ${this.processedCount}/${this.targetCount}</div>
                </div>
                
                <!-- Email List -->
                <div id="inbox-list" style="flex: 1; overflow-y: auto; padding: 10px;">
                    ${this.renderEmailList()}
                </div>
            </div>
        `;

        this.attachListListeners();
    }

    renderEmailList() {
        return this.emails.map((email, idx) => {
            if (email.processed) return '';
            return `
                <div class="email-row" data-idx="${idx}" style="display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid rgba(0,242,255,0.1); cursor: pointer; transition: background 0.2s; background: rgba(255,255,255,0.03);">
                    <div style="margin-right: 15px; font-size: 20px;">✉️</div>
                    <div style="width: 200px; font-weight: bold; color: #f3ff00; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${email.sender}</div>
                    <div style="flex: 1; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 20px;">${email.subject}</div>
                    <div style="color: #888; font-size: 12px;">Bugün</div>
                </div>
            `;
        }).join('');
    }

    attachListListeners() {
        const rows = document.querySelectorAll('.email-row');
        rows.forEach(row => {
            row.onclick = () => {
                const idx = parseInt(row.getAttribute('data-idx'));
                this.showEmailDetail(this.emails[idx], idx);
            };
            row.onmouseover = () => row.style.background = 'rgba(0, 242, 255, 0.1)';
            row.onmouseout = () => row.style.background = 'rgba(255, 255, 255, 0.03)';
        });
    }

    showEmailDetail(email, index) {
        const overlay = document.getElementById('ui-overlay');
        const detailHtml = `
            <div id="email-detail-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100;">
                <div style="width: 550px; background: #001a33; border: 3px solid #f3ff00; border-radius: 15px; overflow: hidden; box-shadow: 0 0 50px rgba(243, 255, 0, 0.3);">
                    <div style="background: rgba(243, 255, 0, 0.1); padding: 15px 25px; border-bottom: 1px solid #f3ff00; display: flex; justify-content: space-between;">
                        <span style="color: #f3ff00; font-weight: bold;">E-POSTA AYRINTISI</span>
                        <button id="close-detail" style="background: none; border: none; color: #ff4444; font-size: 24px; cursor: pointer;">✕</button>
                    </div>
                    <div style="padding: 30px;">
                        <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                            <div style="margin-bottom: 5px;"><span style="color: #00f2ff;">GÖNDEREN:</span> ${email.sender}</div>
                            <div><span style="color: #00f2ff;">KONU:</span> ${email.subject}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 30px; line-height: 1.6; font-size: 15px; min-height: 120px; border-left: 4px solid #00f2ff;">
                            ${email.body}
                        </div>
                        <div style="display: flex; gap: 15px;">
                            <button id="btn-safe" class="cyber-button" style="flex: 1; background: #00ff00; color: #000; border: none;">GÜVENLİ</button>
                            <button id="btn-risky" class="cyber-button" style="flex: 1; background: #ff0000; color: #fff; border: none;">GÜVENLİ DEĞİL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const app = document.getElementById('email-app');
        if (app) app.insertAdjacentHTML('beforeend', detailHtml);

        const closeBtn = document.getElementById('close-detail');
        if (closeBtn) {
            closeBtn.onclick = () => {
                const det = document.getElementById('email-detail-overlay');
                if (det) det.remove();
            };
        }

        const btnSafe = document.getElementById('btn-safe');
        if (btnSafe) btnSafe.onclick = () => this.handleChoice(true, email, index);

        const btnRisky = document.getElementById('btn-risky');
        if (btnRisky) btnRisky.onclick = () => this.handleChoice(false, email, index);
    }

    handleChoice(choiceIsSafe, email, index) {
        const isCorrect = (choiceIsSafe === email.isSafe);
        if (isCorrect) {
            this.updateScore(100);
            this.emails[index].processed = true;
            this.processedCount++;
            
            if (this.processedCount >= this.targetCount) {
                document.getElementById('ui-overlay').innerHTML = '';
                this.handleWin('email_expert');
            } else {
                this.showInboxPhase(); // Re-render list
            }
        } else {
            this.updateScore(-50);
            this.cameras.main.shake(200, 0.01);
            alert("Hatalı karar! Bu e-posta " + (email.isSafe ? "güvenliydi." : "zararlıydı/şüpheliydi."));
            const det = document.getElementById('email-detail-overlay');
            if (det) det.remove();
        }
    }

    generateEmails() {
        const safeTemplates = [
            { sender: 'destek@akademi.edu.tr', subject: 'Ders Programı', body: 'Yeni siber güvenlik ders programınız ektedir. Lütfen saatleri kontrol ediniz.' },
            { sender: 'bilgi@bankaniz.com.tr', subject: 'Hesap Özeti', body: 'Nisan ayı hesap özetiniz dijital olarak hazırlandı. Güvenli bankacılık uygulamanızdan bakabilirsiniz.' },
            { sender: 'noreply@google.com', subject: 'Güvenlik Uyarısı', body: 'Yeni bir cihazdan hesabınıza giriş yapıldı. Bu siz değilseniz şifrenizi resmi kanallardan güncelleyin.' },
            { sender: 'okul@meb.gov.tr', subject: 'Gezi Bilgilendirmesi', body: 'Yarın yapılacak müze gezisi için izin belgelerinizi öğretmenlerinize teslim ediniz.' },
            { sender: 'kutuphane@okul.edu.tr', subject: 'Kitap Hatırlatma', body: 'Ödünç aldığınız "Siber Savunma" kitabının teslim süresi yarın sona ermektedir.' },
            { sender: 'ogretmen@akademi.edu.tr', subject: 'Ödev Geri Bildirimi', body: 'Son ödevinizde kaynakça kısmına daha fazla özen göstermelisiniz. İyi çalışmalar.' },
            { sender: 'bilgi@universite.edu.tr', subject: 'Seminer Daveti', body: 'Yarın konferans salonunda yapılacak olan Yapay Zeka seminerine davetlisiniz.' },
            { sender: 'veli@okulailesi.com', subject: 'Toplantı Gündemi', body: 'Hafta sonu yapılacak olan veli toplantısı gündem maddeleri ektedir.' },
            { sender: 'muzik@platform.com', subject: 'Üyelik Bilgisi', body: 'Aboneliğiniz gelecek ay yenilenecektir. Mevcut planınızda bir değişiklik yoktur.' },
            { sender: 'etkinlik@belediye.gov.tr', subject: 'Bilim Şenliği', body: 'Şehrimizde düzenlenecek bilim şenliği için ücretsiz biletlerinizi alabilirsiniz.' }
        ];

        const riskyTemplates = [
            { sender: 'bedava-iphone@hediye-kazan.net', subject: 'TEBRİKLER!', body: 'Yeni iPhone kazandınız! Hemen bu bilinmeyen bağlantıya tıklayıp adres bilgilerinizi girin.' },
            { sender: 'admin@banka-onay-servis.ru', subject: 'HESABINIZ BLOKE OLDU', body: 'Güvenlik nedeniyle hesabınız kapatıldı. Açmak için kredi kartı bilgilerinizi doğrulayın.' },
            { sender: 'ptt-kargo@ptt-servis.xyz', subject: 'Teslimat Hatası', body: 'Paketiniz teslim edilemedi. 5 TL gümrük ücreti ödemek için aşağıdaki linki kullanın.' },
            { sender: 'ceo-ofis@sirket-mail.tk', subject: 'ACİL DOSYA', body: 'Bu gizli dosyayı hemen indirip çalıştırın ve bana rapor verin.' },
            { sender: 'security@micr0soft-alert.co', subject: 'VİRÜS TESPİT EDİLDİ', body: 'Bilgisayarınızda casus yazılım bulundu. Temizlemek için bu programı hemen kurun.' },
            { sender: 'instagram@destek-merkezi.info', subject: 'Telif Hakkı İhlali', body: 'Hesabınız 24 saat içinde kapatılacaktır. İtiraz etmek için şifrenizle giriş yapın.' },
            { sender: 'netflix@gmail-destek.com', subject: 'Ödeme Sorunu', body: 'Aylık ödemeniz alınamadı. Üyeliğinizin devamı için kart numaranızı güncelleyin.' },
            { sender: 'kanka123@hotmail.com', subject: 'Selam, bakar mısın?', body: 'Yeni numaram bu kanka. Eski resimlerimize bakmak için şu linke tıkla.' },
            { sender: 'bedava-para@kazanc-kapisi.pw', subject: 'Hızlı Kazanç Fırsatı', body: 'Günde 1000 TL kazanmak ister misin? Sadece bu formu doldur ve aramıza katıl.' },
            { sender: 'admin@update-system.bit', subject: 'Sistem Güncelleme', body: 'Windows kopyanızın süresi doldu. Ücretsiz lisans için bu dosyayı çalıştırın.' }
        ];

        let combined = [];
        safeTemplates.forEach(t => combined.push({ ...t, isSafe: true, processed: false }));
        riskyTemplates.forEach(t => combined.push({ ...t, isSafe: false, processed: false }));
        
        return Phaser.Utils.Array.Shuffle(combined);
    }
}
