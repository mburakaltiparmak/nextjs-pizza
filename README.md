# Pizza Restoranı Web Sitesi

Bu proje, **Next.js** ile geliştirilmiş bir Pizza Restoranı web sitesidir. Kullanıcıların pizza sipariş edebileceği, ürünleri sepetlerine ekleyip sipariş işlemlerini tamamlayabileceği dinamik alışveriş özellikleri sunar. Proje, kullanıcı deneyimini geliştirmek amacıyla **Tailwind CSS** ve **ShadcnUI** kullanılarak optimize edilmiş ve **React Redux** ile verimli durum yönetimi sağlanmıştır.

## Proje Özeti

Pizza Restoranı web sitesi, modern web teknolojilerini kullanarak aşağıdaki özellikleri sunar:

- Kullanıcı dostu ve mobil uyumlu bir arayüz
- Pizza çeşitlerini görüntüleme ve dinamik ürün filtreleme
- Ürünleri sepete ekleyebilme, sepet içeriğini yönetebilme
- Sipariş tamamlama (checkout) süreci
- React Redux ile gelişmiş durum yönetimi
- Tailwind CSS ve ShadcnUI ile özelleştirilebilir ve modern tasarım
- Hızlı yükleme süreleri ve cihazlar arasında kesintisiz uyumlu deneyim

## Kullanılan Teknolojiler

- **Next.js**: React tabanlı bir framework, sunucu tarafında render edilen dinamik web uygulamaları geliştirmek için kullanıldı.
- **Tailwind CSS**: CSS frameworkü kullanılarak esnek ve hızlı bir şekilde stil oluşturuldu.
- **ShadcnUI**: UI bileşenleri için ShadcnUI kullanılarak modern ve estetik bir kullanıcı arayüzü geliştirildi.
- **React Redux**: Uygulamanın durum yönetimi için verimli bir şekilde kullanıldı, özellikle alışveriş sepeti ve ürün yönetimi süreçlerinde.
- **SWR**: API isteklerini yönetmek için Next.js'in SWR kütüphanesi kullanıldı, bu sayede veri güncellemeleri optimize edildi.

## Özellikler

- **Pizza Ürünleri Görüntüleme**: Farklı kategorilerdeki pizzaları görüntüleyin ve filtreleyin.
- **Dinamik Sepet Yönetimi**: Ürünleri sepete ekleyin, miktarları ayarlayın ve siparişi tamamlayın.
- **Kullanıcı Dostu Deneyim**: Tüm cihazlar için optimize edilmiş, duyarlı (responsive) tasarım.
- **Verimli Durum Yönetimi**: Redux ile uygulama durumu efektif bir şekilde yönetildi.
- **SEO Optimizasyonu**: Next.js'in sunucu tarafı render (SSR) ve statik site oluşturma (SSG) özellikleri kullanılarak SEO dostu hale getirildi.

## Kurulum ve Çalıştırma

1. Projeyi klonlayın:

   ```bash
   git clone https://github.com/mburakaltiparmak/nextjs-pizza
   ```

2. Gerekli bağımlılıkları yükleyin:

   ```bash
   cd nextjs-pizza
   npm install
   ```

3. Geliştirme ortamını başlatın:

   ```bash
   npm run dev
   ```

4. Tarayıcınızda `http://localhost:3000` adresine gidin ve projeyi keşfedin.

## Proje Yapısı

```
/components     # UI bileşenleri
/pages          # Next.js sayfaları
/lib            # Redux store ve slice'lar
/globals.css    # Tailwind CSS ve global stiller

```

## Katkıda Bulunma

Bu projeye katkıda bulunmak isterseniz, lütfen önce bir pull request oluşturun. Herhangi bir hata bildirimi veya öneri için de issues kısmını kullanabilirsiniz.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakabilirsiniz.
