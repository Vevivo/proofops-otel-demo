# Doğrulanmış kaynaklar ve mimari dayanak

Kontrol tarihi: 2026-07-16

## AR.IO

- [AR.IO ana sayfası](https://ar.io/): mevcut sistemlerle SDK, CLI, API ve resmî eklentiler üzerinden entegrasyon; “more coming soon” ve özel entegrasyon çağrısı.
- [AR.IO Provenance](https://ar.io/provenance/): AR.IO’nun mevcut sistemlerin yerine geçmeyen, onların verisini kanıtlanabilir hâle getiren tarafsız doğrulama katmanı konumu.
- [AR.IO Enterprise](https://ar.io/enterprise/): self-service, managed essentials ve managed dedicated servis modelleri; bütünlük, erişim ve denetim iddiaları.
- [AR.IO Cloudmap](https://ar.io/cloudmap/): “Integrate Once, Reach All” ve stratejik ekosistem ortaklıkları yönü.
- [AR.IO Anchor](https://github.com/ar-io/ar-io-anchor): `@ar.io/anchor`, `ario.events/v1`, Merkle batching, S3/LangChain/Vercel adaptörleri, minimal disclosure ve evidence bundle akışı.
- [AR.IO Proof](https://github.com/ar-io/ar-io-proof): mevcut bağımsız doğrulama çekirdeği ve kanıt formatları.
- [AR.IO MLflow](https://github.com/ar-io/ar-io-mlflow): AR.IO üzerine kurulmuş mevcut lifecycle entegrasyon örneği.
- [AR.IO Node](https://github.com/ar-io/ar-io-node): ağ geçidi altyapısı; OpenTelemetry’nin AR.IO tarafında operasyonel gözlemlenebilirlik için zaten kullanıldığı görülüyor. ProofOps farklı olarak müşterinin seçilmiş audit event’lerini kanıtlar.

## OpenTelemetry

- [OpenTelemetry dokümantasyonu](https://opentelemetry.io/docs/): vendor-neutral telemetry standardı; 90’dan fazla observability sağlayıcısının desteği ve geniş dil/platform kapsamı.
- [Collector Architecture](https://opentelemetry.io/docs/collector/architecture/): receiver, processor ve exporter pipeline genişletme modeli.
- [OpenTelemetry Logs](https://opentelemetry.io/docs/concepts/signals/logs/): Collector’ın genel amaçlı log agent’i olarak kullanımı ve log/trace korelasyonu.
- [OpenTelemetry adopters](https://opentelemetry.io/ecosystem/adopters/): gerçek kurum kullanım örnekleri.

## Hibe durumu hakkında önemli düzeltme

- [AR.IO Grants repository](https://github.com/ar-io/ar-io-grants): depo 2026-06-12 tarihinde arşivlendi. README, ilk hibe döneminin sona erdiğini ve yeni başvuruların kapalı olduğunu belirtiyor.
- Eski programın değerlendirme kriterleri impact, innovation, experience, feasibility ve mission/vision uyumuydu; entegrasyonlar açık odak alanlarından biriydi. Bunlar yeni dönemin aynı koşullarla açılacağı anlamına gelmez.

Bu proje “aktif bir hibe kesin vardır” iddiasında bulunmaz. Amaç; güncel ekosistem görüşmesi, olası gelecek fonlama/RFP, sponsorluk, ortak satış veya ücretli pilot için somut kanıt oluşturmaktır.

## Dürüst ürün sınırları

- Yerel demo kanıtı AR.IO network receipt değildir; arayüz bunu açıkça belirtir.
- Kalıcı AR.IO kanıtı yalnızca `ENABLE_ARIO_DEV_UPLOAD=1` ve açık operatör tercihiyle çalıştırılır.
- SHA-256 hash’leri düşük entropili kaynaklar için tahmin/eşitlik riski taşıyabilir.
- Demo uyumluluk sertifikası, hukuki uygunluk veya içeriğin doğru olduğu garantisini vermez.
- Üretim sürümü authentication, quotas, KMS, durable queues/receipts, incident response, monitoring, privacy review ve SLA gerektirir.
