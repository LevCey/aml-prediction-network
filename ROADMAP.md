# AML Prediction Network - Roadmap

## 🎯 Mevcut Durum (23 Ocak 2026)
- ✅ Hackathon kazanıldı (Canton Catalyst 2026)
- ✅ Landing page: amlprediction.com
- ✅ Demo app: amlprediction.network
- ✅ Waitlist formu aktif
- ✅ Sosyal medya: Twitter, LinkedIn, YouTube
- 🔄 Mentörlük programı devam ediyor (Şubat 13'e kadar)

---

## 📅 3 Haftalık Plan (Şubat 13 Final)

### Hafta 1: 24-26 Ocak - Temel Geliştirme
- [ ] DAML dokümantasyonu çalış
- [ ] Compliance modülü geliştir
- [ ] Chris ile ilk görüşme (Pazartesi/Salı)
- [ ] DevNet erişimi için Chris'ten yardım iste

### Hafta 2: 27 Ocak - 2 Şubat - DevNet & Feedback
- [ ] DevNet deployment
- [ ] Chris feedback'ine göre düzeltmeler
- [ ] Compliance UI test
- [ ] Waitlist büyütme (hedef: 20 kişi)

### Hafta 3: 3-13 Şubat - Final Hazırlık
- [ ] Final demo hazırla
- [ ] Pitch deck oluştur
- [ ] Sunum provası
- [ ] Son polish (yeni özellik YOK)

---

## 🎯 Şubat 13 Hedef Çıktılar
1. ✅ DevNet'te çalışan demo
2. ✅ Compliance UI (3 ekran)
3. ✅ Pitch deck (1 sayfa)
4. ✅ Waitlist (hedef: 20-50 kişi)

---

## 🏦 Compliance Modülü (MVP PRİORİTE)

### Altın Prensip
> Compliance = ekstra modül değil, DAML modelinin doğal sonucu

### DAML Template Yapısı
```daml
template EscrowAgreement
  with
    bankA : Party
    bankB : Party
    auditor : Party
    amount : Decimal
  where
    signatory bankA, bankB
    observer auditor  -- Auditor görür ama aksiyon alamaz
```

### Compliance UI (3 Ekran)

#### 1️⃣ Active Contracts
- Kimler taraf?
- Tutar?
- Durum?

#### 2️⃣ Event History
- Oluşturuldu
- Güncellendi
- Kapandı

#### 3️⃣ Violations
- Yetkisiz deneme var mı?
- Reddedilen işlemler
- (Boş bile olabilir - iyi sinyal)

### Auditor Node Yetkileri
| Yetki | Var mı |
|-------|--------|
| Aktif sözleşmeleri görme | ✅ |
| Geçmişi görme | ✅ |
| Choice çalıştırma | ❌ |
| Veri silme | ❌ |

---

## 📊 Ek Özellikler (Sonraki Aşama)

### Pattern Similarity Scoring (Phase 2)
- [ ] Characteristics bazlı benzerlik hesaplama
- [ ] %80+ benzerlik = eşleşme sayılır
- [ ] MVP'de exact match, Phase 2'de similarity
- [ ] Demo notu: "MVP'de exact match, Phase 2'de similarity scoring ekleyeceğiz"

### Otomatik Participant Belirleme (Phase 2)
- [ ] FraudPattern observers'ı otomatik participant olsun
- [ ] Network üyeliği sistemi
- [ ] MVP'de manuel liste, Phase 2'de otomatik

### Otomatik Market Kapanma (Phase 2)
- [ ] Deadline gelince market otomatik kapansın
- [ ] Canton Automation veya backend trigger
- [ ] MVP'de manuel, Phase 2'de otomatik

### Risk Score Visualization
- [ ] Gauge/meter komponenti
- [ ] Yeşil → Sarı → Kırmızı renk kodlaması
- [ ] "78.3% fraud risk" gösterimi

### SAR Auto-Generation
- [ ] Risk threshold geçince otomatik SAR taslağı
- [ ] PDF/text çıktısı
- [ ] Compliance ekibi için zaman tasarrufu

### Multi-Bank Demo
- [ ] 2-3 banka simülasyonu
- [ ] Bank A pattern paylaşır → Bank B anında görür
- [ ] Privacy + collaboration gösterimi

### Pattern Library UI
- [ ] Paylaşılan fraud pattern listesi
- [ ] "Bu pattern X bankada görüldü" istatistiği
- [ ] Network effect somutlaştırması

---

## 🎤 Demo Sırasında Söylenecek 3 Cümle

### 🇹🇷 Türkçe
1. **"Auditor burada, ama hiçbir şey yapamıyor."**
2. **"Bu kuralı backend'den kapatamam."**
3. **"Biz bu ürünü kapatsak bile, ledger çalışmaya devam eder."**

### 🇬🇧 English
1. **"The auditor can see everything, but cannot take any action."**
   - Telaffuz: *"Di oditır ken sii evritiŋ, bat kenot teyk eni akşın."*

2. **"I cannot disable this rule from the backend."**
   - Telaffuz: *"Ay kenot diseybl dis ruul from di bek-end."*

3. **"Even if we shut down our product, the ledger keeps running."**
   - Telaffuz: *"İivın if wii şat daun aur pradakt, di lecır kiips raniŋ."*

---

## 📈 MVP → Pilot Geçişi

| MVP | Pilot |
|-----|-------|
| 1 auditor | 2 auditor |
| Manuel review | Scheduled reports |
| Basit UI | PDF export |
| Tek banka | 2-3 banka |

---

## 🔗 DevNet Gereksinimleri

- [ ] Sponsor bul (Chris?)
- [ ] Statik IP adresi
- [ ] VPN erişimi
- [ ] Whitelist onayı (2-7 gün)

---

## 💰 Yatırım Stratejisi

### Traction (En Önemli)
Pre-seed için gelir şart değil, ama şunlar lazım:
- [ ] **LOI (Letter of Intent)** - 1-2 bankadan "pilot yapmak isteriz" mektubu
- [ ] **Waitlist** - Landing page'e email toplama formu ekle
- [ ] **Pilot görüşmeleri** - "3 banka ile görüşme aşamasındayız" diyebilmek

### Yatırımcıların Baktığı Metrikler
| Metrik | Hedef |
|--------|-------|
| False positive azaltma | %70+ |
| Compliance maliyet tasarrufu | %30+ |
| Audit hazırlık süresi | %50 azalma |
| Detection hızı | 24 saat → Real-time |

### Pitch Deck (9 Slide)
1. Problem ($180B maliyet, %95 false positive)
2. Çözüm (Privacy-preserving prediction markets)
3. Demo/Product
4. Market size ($130B+ RegTech by 2026)
5. Business model
6. Traction (pilot, LOI, waitlist)
7. Competition (neden Canton?)
8. Team
9. Ask (ne kadar, ne için)

### Hedef Yatırımcılar (RegTech Focused)
| Yatırımcı | Focus | Aşama |
|-----------|-------|-------|
| Y Combinator | Erken aşama | $500K |
| Anthemis Group | Fintech/RegTech | Seed-Series B |
| QED Investors | AML/Compliance | Series A-B |
| Nyca Partners | Banking compliance | Series A-B |
| Plug and Play Fintech | Accelerator | Pre-seed |

### Canton Avantajı (Unique Selling Point)
- Digital Asset $135M yatırım aldı
- DRW + Liberty City $500M Canton Coin treasury
- Goldman Sachs, BNP Paribas, Deutsche Börse kullanıyor
- "Institutional blockchain" = güven

---

## 📅 Yatırım Zaman Çizelgesi

### Hemen (Bu Hafta)
- [ ] Landing page'e waitlist/email formu ekle
- [ ] Compliance modülü geliştir

### Kısa Vadeli (Şubat)
- [ ] 1-2 küçük banka/fintech ile pilot görüşmesi
- [ ] LOI almaya çalış
- [ ] Pitch deck hazırla

### Orta Vadeli (Mart-Nisan)
- [ ] Y Combinator başvurusu
- [ ] Anthemis/QED'e cold outreach
- [ ] Canton ekosisteminden referans al

---

## 💡 Hızlı Kazanımlar

- [ ] **Waitlist formu** - "X kişi bekliyor" diyebilmek için
- [ ] **Advisor** - Compliance/AML uzmanını advisory board'a al
- [ ] **Case study** - Hackathon demosunu dokümante et
- [ ] **Security** - SOC 2 yolunda olduğunu belirt

---

## 📝 Notlar

- Bankalar "wow UI"ya değil, "risk yok" hissine para verir
- Compliance sonradan eklenen değil, doğal parça olmalı
- Küçük ama derin MVP > Geniş ama yüzeysel MVP
- RegTech market: $130B+ (2026), %31.87 yıllık büyüme
- Bankalar 2024'te $19.3B ceza ödedi - büyük fırsat
