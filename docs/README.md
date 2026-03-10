# 🍽 QR Menu Restaurant System

Modern bir restoran için geliştirilmiş **QR tabanlı dijital menü sistemi**.  
Müşteriler masadaki QR kodu okutarak mobil cihazlarından menüyü görüntüleyebilir.

Bu proje iki ana parçadan oluşur:

- **Backend:** ASP.NET Core Web API (Katmanlı Mimari)
- **Frontend:** React (mobil uyumlu arayüz)

Sipariş sistemi şu an dahil değildir. Siparişler garsonlar tarafından alınmaktadır.  
Sistem ileride sipariş modülü eklenebilecek şekilde tasarlanmıştır.

---

# 🚀 Features

## Public Features (Customer)

- QR kod ile menüye erişim
- Kategorilere göre ürün listeleme
- Ürün detay sayfası
- Ürün fiyatı ve içerik bilgisi
- Mobil uyumlu arayüz
- Anasayfa tanıtım alanı
- Hakkımızda sayfası
- İletişim sayfası

---

## Admin Features

- Ürün yönetimi
- Kategori yönetimi
- Görsel yükleme sistemi
- Upload log sistemi
- Duplicate image detection (SHA256 hash)
- Antivirus scan desteği
- Admin API Key koruması
- Rate limiting koruması

---

# 🏗 Architecture

Backend tarafı **katmanlı mimari (Layered Architecture)** kullanılarak geliştirilmiştir.

## Project Structure
```

RestaurantProject
│
├── src
│   ├── Restaurant.Api
│   ├── Restaurant.Application
│   ├── Restaurant.Domain
│   ├── Restaurant.Infrastructure
│   └── Restaurant.Persistence
│
├── frontend
│   └── restaurant-frontend (React)
│
└── Restaurant.sln

```

Backend katmanları:

- **API Layer** → Controller'lar
- **Application Layer** → Use case ve servisler
- **Domain Layer** → Entity ve domain modelleri
- **Infrastructure Layer** → dış servis entegrasyonları
- **Persistence Layer** → EF Core ve veritabanı işlemleri

---

# 🛠 Tech Stack

## Backend

- ASP.NET Core Web API
- Entity Framework Core
- MSSQL
- Katmanlı Mimari
- Swagger

## Frontend

- React
- Axios
- TailwindCSS / CSS
- Mobile-first UI

## Security

- Admin API Key
- Rate limiting
- Upload antivirus scan
- SHA256 duplicate file detection

---

# 📱 Mobile First Design

Sistem özellikle **restoran müşterilerinin mobil cihaz kullanacağı düşünülerek** tasarlanmıştır.

- responsive layout
- mobile friendly menu cards
- hızlı sayfa yükleme
- basit navigasyon

---

# 📡 API Endpoints

## Public API

- GET /api/public/categories
- GET /api/public/categories/{slug}/products
- GET /api/public/products/{id}
- GET /api/public/content/{key}


---

## Admin API


- POST /api/admin/categories
- PUT /api/admin/categories/{id}
- DELETE /api/admin/categories/{id}

- POST /api/admin/products
- PUT /api/admin/products/{id}
- DELETE /api/admin/products/{id}


---

## Upload API

- POST /api/admin/uploads/product-image
- DELETE /api/admin/uploads/{id}
- GET /api/admin/uploads


---

# 🔐 Security

Admin işlemleri **API Key** ile korunmaktadır.


Production ortamında API key **environment variable** olarak tutulmalıdır.

---

# 🖼 Image Upload System

Upload sistemi aşağıdaki özellikleri içerir:

- SHA256 hash hesaplama
- duplicate image detection
- antivirus scan
- upload logging
- file size validation
- mime type validation



---

# 📷 Screenshots




---

# 🧩 Future Improvements

Planlanan geliştirmeler:

- sipariş sistemi
- masa yönetimi
- online ödeme
- garson paneli
- çoklu dil desteği
- restoran tema özelleştirme

---

# 👨‍💻 Author

Developed by **Ali**

---

# ⭐ Project Purpose

Bu proje bir restoran için **QR tabanlı dijital menü sisteminin nasıl geliştirileceğini göstermek amacıyla hazırlanmıştır.**

---

