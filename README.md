# Pizza Restoranı Web Uygulaması

Bu proje, modern web teknolojileri kullanılarak geliştirilmiş kapsamlı bir Pizza Restoranı web uygulamasıdır. Kullanıcıların pizza menüsünü inceleyebileceği, özel pizza tasarlayabileceği, ürünleri sepete ekleyip ödeme yapabileceği ve siparişlerini takip edebileceği tam işlevsel bir e-ticaret deneyimi sunar.

## Proje Özeti

Pizza Restoranı web uygulaması aşağıdaki özellikleri sunar:

- Kullanıcı dostu ve tüm cihazlarda uyumlu (responsive) arayüz
- Kapsamlı kullanıcı kimlik doğrulama sistemi (Google OAuth dahil)
- Kişiselleştirilmiş özel pizza tasarım arayüzü
- Gelişmiş sepet yönetimi ve sipariş takibi
- Çoklu ödeme seçenekleri (Online kredi kartı, kapıda ödeme)
- Adres yönetimi ve teslimat takibi
- Etkileşimli sipariş durum bildirimleri
- Admin paneli ve sipariş yönetimi

## Kullanılan Teknolojiler

### Front-End

- **Next.js 15.4.0-canary.26**: React tabanlı modern framework, sayfa yönlendirmesi, API rotaları ve SSR/SSG özellikleri için kullanıldı
- **React 18**: Kullanıcı arayüzü bileşenlerini ve etkileşimleri geliştirmek için kullanıldı
- **Redux Toolkit**: Durum yönetimi, asenktion işlemler ve karmaşık veri akışı için kullanıldı
- **Tailwind CSS**: Hızlı, özelleştirilebilir ve tutarlı bir tasarım sistemi için kullanıldı
- **ShadcnUI**: Modern UI bileşenleri ve duyarlı tasarım için kullanıldı
- **React Hook Form**: Form validasyonu ve yönetimi için kullanıldı
- **Zod**: Şema tabanlı doğrulama için kullanıldı
- **Lucide React**: Minimalist, özelleştirilebilir ikonlar için kullanıldı
- **FontAwesome**: Ek ikonlar ve görsel öğeler için kullanıldı

### Back-End

- **Spring Boot**: Java tabanlı API servisleri için kullanıldı
- **PostgreSQL**: Supabase üzerinde veritabanı yönetimi için kullanıldı
- **Spring Security**: Kimlik doğrulama ve yetkilendirme için kullanıldı
- **JWT**: Güvenli token tabanlı yetkilendirme için kullanıldı
- **Hibernate**: ORM veri erişimi için kullanıldı
- **Cloudinary**: Görsel depolama ve yönetimi için kullanıldı
- **SendGrid**: Transaksiyonel e-posta gönderimi için kullanıldı

### Deployment & DevOps

- **Fly.io**: Containerize edilmiş backend uygulamasının dağıtımı için kullanıldı
- **Vercel**: Frontend uygulamasının dağıtımı ve otomatik CI/CD için kullanıldı
- **Docker**: Uygulama containerization için kullanıldı
- **Supabase**: PostgreSQL veri tabanı hosting için kullanıldı

## Gelişmiş Özellikler

### Kullanıcı Deneyimi

- **Özel Pizza Tasarımı**: Malzeme, hamur ve boyut seçenekleriyle tamamen özelleştirilebilir pizzalar
- **Sepet Senkronizasyonu**: Yerel depolama ile cihazlar arası sepet senkronizasyonu
- **Otomatik Fiyat Hesaplama**: Seçimlere göre dinamik fiyat hesaplaması
- **Anlık Bildirimler**: Toast bildirimleri ile kullanıcı etkileşimleri
- **Adres Yönetimi**: Çoklu adres saklama ve yönetimi
- **Sipariş Geçmişi**: Kullanıcılar için geçmiş siparişleri görüntüleme ve sipariş detayları

### Güvenlik

- **JWT Tabanlı Kimlik Doğrulama**: Güvenli oturum yönetimi
- **OAuth Entegrasyonu**: Google hesabıyla hızlı kayıt ve giriş
- **Güvenli Ödeme İşlemleri**: SSL korumalı ödeme akışı
- **Veri Validasyonu**: Hem client hem de server tarafında kapsamlı veri doğrulama
- **CORS Yapılandırması**: Güvenli API erişimi

### Performans

- **Service Layer Mimarisi**: API çağrılarının merkezi yönetimi ve optimizasyonu
- **Gelişmiş Caching**: Redux tarafında özel cache mekanizması (TTL ve invalidation destekli)
- **Debouncing & Throttling**: Arama ve input işlemlerinde performans koruması
- **Lazy Loading**: Gerektiğinde yüklenen bileşenler
- **Image Optimization**: Next.js image optimizasyonu
- **State Management**: Optimize edilmiş Redux Toolkit entegrasyonu
- **Code Splitting**: Daha hızlı yükleme süreleri için kod bölümleme

## Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 18.x veya üzeri
- Java 17 veya üzeri (backend için)
- PostgreSQL veritabanı
- npm veya yarn

### Frontend Kurulumu

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/mburakaltiparmak/nextjs-pizza
   ```
2. Gerekli bağımlılıkları yükleyin:
   ```bash
   cd nextjs-pizza
   npm install
   ```
3. Ortam değişkenlerini ayarlayın (`.env.local` dosyası oluşturun):
   ```
   NEXT_PUBLIC_API_URL=https://api.burakaltiparmak.site
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Geliştirme ortamını başlatın:
   ```bash
   npm run dev
   ```
5. Tarayıcınızda `http://localhost:3000` adresine gidin ve uygulamayı keşfedin.

### Backend Kurulumu (İsteğe Bağlı)

1. Backend repo'sunu klonlayın:
   ```bash
   git clone https://github.com/mburakaltiparmak/pizza-backend
   ```
2. Projeyi IDE'nizde açın (IntelliJ IDEA, Eclipse vb.)
3. Maven bağımlılıklarını yükleyin
4. `application.properties` dosyasını yapılandırın:
   ```
   spring.datasource.url=jdbc:postgresql://your-db-url
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   ```
5. Uygulamayı çalıştırın

## Proje Yapısı

```
/src
  /app                  # Next.js App Router sayfaları
    /api                # API endpoints
    /auth               # Kimlik doğrulama sayfaları
    /create-order       # Sipariş oluşturma akışı
    /menu               # Menü sayfaları
    /profile            # Kullanıcı profil sayfaları
    /success            # Sipariş onay sayfası
  /components           # Yeniden kullanılabilir UI bileşenleri
    /ui                 # Temel UI bileşenleri (ShadcnUI)
    /create-order-components   # Sipariş akışı bileşenleri
    /layout             # Layout bileşenleri
  /lib                  # Yardımcı fonksiyonlar ve utilities
    /store              # Redux store
      /actions          # Redux actions
      /reducers         # Redux reducers
    /hooks              # Custom React hooks
  /assets               # Statik varlıklar (resimler vb.)
  /styles               # Global ve modül stilleri
```

## Katkıda Bulunma

Bu projeye katkıda bulunmak isterseniz:

1. Projeyi forklayın
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Canlı Demo

Uygulamanın çalışan bir örneğini https://nextjs-pizza-mu.vercel.app adresinde görebilirsiniz.

## İletişim

Mehmet Burak Altıparmak - [@mburakaltiparmak](https://github.com/mburakaltiparmak) - mburakaltiparmak@gmail.com

Proje Linki: [https://github.com/mburakaltiparmak/nextjs-pizza](https://github.com/mburakaltiparmak/nextjs-pizza)

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakabilirsiniz.

---

Bu projede kullanılan tüm marka ve logolar ilgili sahiplerinin ticari markalarıdır. Bu proje gerçek bir işletmeyi temsil etmemektedir ve sadece eğitim/portfolio amaçlıdır.
