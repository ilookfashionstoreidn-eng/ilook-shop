# Product Requirements Document
# iLook Fashion — Platform E-Commerce Terintegrasi

---

| | |
|---|---|
| **Versi** | 1.0.0 |
| **Tanggal** | 17 Juni 2026 |
| **Status** | Draft |
| **Toko** | iLook Fashion |
| **Tech Stack** | Laravel (Backend) + React (Frontend) Inertia JS |
| **Integrasi** | Ginee · Raja Ongkir · Payment Gateway |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang](#2-latar-belakang)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Ruang Lingkup](#4-ruang-lingkup)
5. [Arsitektur Teknis](#5-arsitektur-teknis)
6. [Fitur & Persyaratan Fungsional](#6-fitur--persyaratan-fungsional)
   - 6.1 [Autentikasi & Manajemen Akun](#61-autentikasi--manajemen-akun)
   - 6.2 [Manajemen Produk](#62-manajemen-produk)
   - 6.3 [Storefront (Halaman Toko)](#63-storefront-halaman-toko)
   - 6.4 [Keranjang & Checkout](#64-keranjang--checkout)
   - 6.5 [Integrasi Ginee](#65-integrasi-ginee)
   - 6.6 [Integrasi Raja Ongkir](#66-integrasi-raja-ongkir)
   - 6.7 [Integrasi Payment Gateway](#67-integrasi-payment-gateway)
   - 6.8 [Manajemen Pesanan](#68-manajemen-pesanan)
   - 6.9 [Notifikasi](#69-notifikasi)
   - 6.10 [Dashboard Admin](#610-dashboard-admin)
7. [Persyaratan Non-Fungsional](#7-persyaratan-non-fungsional)
8. [User Stories](#8-user-stories)
9. [Alur Sistem (Flow)](#9-alur-sistem-flow)
10. [Struktur Database (Ringkasan)](#10-struktur-database-ringkasan)
11. [Rencana Pengembangan](#11-rencana-pengembangan)
12. [Risiko & Mitigasi](#12-risiko--mitigasi)
13. [Kriteria Penerimaan](#13-kriteria-penerimaan)
14. [Lampiran & Referensi](#14-lampiran--referensi)

---

## 1. Ringkasan Eksekutif

**iLook Fashion** adalah platform e-commerce single-store yang dibangun khusus untuk toko fashion **iLook Fashion**. Platform ini memungkinkan pengelolaan toko online secara mandiri dengan integrasi penuh terhadap:

- **Ginee** — sinkronisasi produk, stok, dan pesanan dari/ke marketplace lain (Tokopedia, Shopee, dll.)
- **Raja Ongkir** — kalkulasi ongkos kirim real-time dari 30+ kurir Indonesia
- **Payment Gateway** — penerimaan pembayaran multimetode (VA bank, e-wallet, QRIS, kartu kredit)

Platform dibangun dengan **Laravel** sebagai backend API dan **React** sebagai frontend, mencakup dua sisi utama: **storefront** untuk pembeli dan **admin panel** untuk pengelola toko iLook Fashion.

---

## 2. Latar Belakang

iLook Fashion saat ini kemungkinan berjualan melalui satu atau beberapa marketplace (Tokopedia, Shopee, dll.) dengan tantangan:

- Stok sulit dipantau secara terpusat saat berjualan di banyak platform
- Tidak ada toko online mandiri dengan branding sendiri
- Proses pesanan masih manual dan terpisah-pisah
- Kalkulasi ongkir dilakukan manual per transaksi

**Solusi:** Website e-commerce sendiri (`ilookfashion.com`) yang terintegrasi dengan Ginee untuk sentralisasi manajemen, Raja Ongkir untuk ongkir otomatis, dan payment gateway untuk pembayaran yang aman dan beragam.

---

## 3. Tujuan Produk

### Tujuan Bisnis
- Memiliki toko online beridentitas brand sendiri (independent store)
- Mengurangi waktu pemrosesan pesanan dari manual menjadi otomatis
- Meminimalkan risiko overselling dengan sinkronisasi stok real-time via Ginee
- Meningkatkan konversi dengan pilihan pembayaran yang lengkap

### Tujuan Teknis
- Membangun sistem yang scalable dengan Laravel API + React SPA
- Integrasi yang handal dengan Ginee, Raja Ongkir, dan Payment Gateway
- Uptime minimal 99.5% dengan response time < 2 detik

---

## 4. Ruang Lingkup

### ✅ Dalam Ruang Lingkup

| Modul | Deskripsi |
|---|---|
| Storefront | Halaman toko publik untuk pembeli |
| Admin Panel | Dashboard pengelola toko iLook Fashion |
| Manajemen Produk | CRUD produk, varian, kategori, stok |
| Checkout | Keranjang, pengiriman, pembayaran |
| Integrasi Ginee | Sync produk, stok, dan pesanan dua arah |
| Integrasi Raja Ongkir | Kalkulasi ongkir real-time, tracking resi |
| Integrasi Payment Gateway | Midtrans sebagai primary gateway |
| Manajemen Pesanan | Status, resi, invoice, retur |
| Notifikasi | Email + WhatsApp untuk pembeli dan admin |
| Laporan | Penjualan harian/bulanan, export CSV |

### ❌ Di Luar Ruang Lingkup (Fase Ini)

- Aplikasi mobile native (iOS/Android)
- Multi-toko / multi-tenant
- Fitur livestream / video commerce
- Program affiliate dan referral
- Integrasi marketplace secara langsung (ditangani Ginee)

---

## 5. Arsitektur Teknis

### 5.1 Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA, Tailwind CSS, React Query |
| **Backend** | Laravel 11 | RESTful API, Sanctum Auth |
| **Database** | MySQL 8 | Primary database |
| **Cache** | Redis | Session, ongkir cache, rate limit |
| **Queue** | Laravel Queue (Redis driver) | Notifikasi, sync Ginee async |
| **File Storage** | AWS S3 / Cloudflare R2 | Foto produk, invoice PDF |
| **Web Server** | Nginx + PHP-FPM | Reverse proxy ke Laravel |
| **Deployment** | VPS / Cloud (Ubuntu 22.04) | Docker Compose opsional |

### 5.2 Struktur Proyek

```
ilook-fashion/
├── backend/               # Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/           # Endpoint publik (produk, checkout)
│   │   │   └── Admin/         # Endpoint admin panel
│   │   ├── Services/
│   │   │   ├── GineeService.php
│   │   │   ├── RajaOngkirService.php
│   │   │   └── PaymentService.php
│   │   ├── Models/
│   │   └── Jobs/              # Queue jobs (sync, notifikasi)
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   └── config/
│       └── services.php       # Konfigurasi API key eksternal
│
└── frontend/              # React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── store/         # Storefront publik
    │   │   └── admin/         # Admin panel
    │   ├── components/
    │   ├── hooks/
    │   └── services/          # Axios API client
    └── public/
```

### 5.3 Arsitektur Integrasi

```
Browser (React)
     │
     ▼
Laravel API (REST)
     │
     ├──► Ginee API          (produk sync, pesanan push, stok update)
     │         │
     │         └──► Webhook ──► Laravel Webhook Handler
     │
     ├──► Raja Ongkir API    (kalkulasi ongkir, tracking resi)
     │
     ├──► Midtrans API       (buat transaksi, validasi pembayaran)
     │         │
     │         └──► Webhook ──► Laravel Webhook Handler
     │
     ├──► WhatsApp API       (notifikasi outbound)
     └──► Email (SMTP/Mailgun)
```

### 5.4 Environment Variables (`.env`)

```env
# App
APP_NAME="iLook Fashion"
APP_URL=https://ilookfashion.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=ilook_fashion

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Ginee
GINEE_API_URL=https://openapi.ginee.com
GINEE_CLIENT_ID=
GINEE_CLIENT_SECRET=

# Raja Ongkir
RAJAONGKIR_API_KEY=
RAJAONGKIR_API_URL=https://api.rajaongkir.com/starter

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# WhatsApp Business
WA_API_URL=
WA_TOKEN=
WA_PHONE_ID=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=ilook-fashion
```

---

## 6. Fitur & Persyaratan Fungsional

---

### 6.1 Autentikasi & Manajemen Akun

#### Admin (Pengelola iLook Fashion)
- Login dengan email + password menggunakan Laravel Sanctum
- Session token dengan expiry 8 jam (dapat dikonfigurasi)
- Logout dan invalidasi token

#### Pembeli
- Registrasi dengan email + password
- Verifikasi email (opsional, bisa skip untuk UX lebih lancar)
- Login dengan email/password
- Login dengan Google OAuth (opsional, fase 2)
- Halaman profil: nama, nomor HP, daftar alamat tersimpan
- Riwayat pesanan

#### Endpoint Laravel (contoh)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

---

### 6.2 Manajemen Produk

#### Fitur
- Tambah / edit / hapus produk
- Setiap produk memiliki:
  - Nama, deskripsi (rich text), SKU
  - Kategori (multi-level, contoh: Pakaian > Wanita > Dress)
  - Berat (gram) — digunakan untuk kalkulasi ongkir
  - Dimensi (opsional: panjang x lebar x tinggi cm)
  - Harga normal + harga coret (harga diskon)
  - Status: `active` | `inactive` | `out_of_stock`
- Upload foto produk: hingga 10 foto, format JPG/PNG/WebP, maks 5MB/foto
- Foto disimpan di S3/R2, URL disimpan di database

#### Varian Produk
- Setiap produk dapat memiliki varian (contoh: Ukuran S/M/L/XL, Warna Hitam/Putih)
- Setiap varian memiliki: SKU tersendiri, stok, harga (opsional override), foto (opsional)
- Kombinasi varian otomatis di-generate dari atribut yang dipilih

#### Stok
- Stok dikelola per varian (atau per produk jika tanpa varian)
- Stok minimum alert: notifikasi ke admin jika stok < threshold yang dikonfigurasi
- Riwayat perubahan stok tersimpan (audit log)

#### Endpoint Laravel (contoh)
```
GET    /api/products                  # Daftar produk (publik, storefront)
GET    /api/products/{slug}           # Detail produk
GET    /api/admin/products            # Daftar produk (admin)
POST   /api/admin/products            # Tambah produk
PUT    /api/admin/products/{id}       # Edit produk
DELETE /api/admin/products/{id}       # Hapus produk
POST   /api/admin/products/{id}/images
POST   /api/admin/products/import     # Import dari CSV / Ginee
```

---

### 6.3 Storefront (Halaman Toko)

Ini adalah tampilan publik yang dilihat pembeli di `ilookfashion.com`.

#### Halaman Beranda (`/`)
- Hero banner (gambar + teks, dapat diubah dari admin)
- Seksi "Produk Terbaru"
- Seksi "Produk Terlaris"
- Seksi "Kategori Pilihan"
- Banner promo (opsional)

#### Halaman Kategori (`/kategori/[slug]`)
- Grid produk berdasarkan kategori
- Filter: harga (rentang), ukuran, warna, ketersediaan stok
- Sortir: terbaru, terlaris, harga terendah, harga tertinggi
- Paginasi (infinite scroll atau halaman)

#### Halaman Produk (`/produk/[slug]`)
- Galeri foto dengan thumbnail dan zoom
- Pilih varian (ukuran, warna) dengan indikator stok per varian
- Harga (termasuk harga coret jika ada diskon)
- Kalkulator ongkir: input kota tujuan → tampil pilihan kurir + estimasi (via Raja Ongkir)
- Tombol "Tambah ke Keranjang" dan "Beli Sekarang"
- Deskripsi produk
- Ulasan pembeli (fase 2)

#### Halaman Pencarian (`/cari?q=...`)
- Full-text search nama dan deskripsi produk
- Filter dan sortir yang sama dengan halaman kategori

#### Halaman Lainnya
- `/tentang-kami` — informasi toko iLook Fashion
- `/kontak` — form kontak
- `/kebijakan-privasi`, `/syarat-ketentuan`

---

### 6.4 Keranjang & Checkout

#### Keranjang
- Keranjang tersimpan di `localStorage` untuk guest, di database untuk user yang login
- Tambah/kurangi jumlah item
- Hapus item
- Subtotal otomatis diperbarui
- Stok divalidasi ulang saat checkout dimulai

#### Checkout — Step 1: Alamat
- Pilih dari alamat tersimpan atau input alamat baru
- Field: nama penerima, nomor HP, alamat lengkap, kecamatan, kota/kabupaten, provinsi, kode pos
- Dropdown kota menggunakan data dari Raja Ongkir (`/city`)
- Simpan sebagai alamat baru (jika login)

#### Checkout — Step 2: Pengiriman
- Sistem memanggil Raja Ongkir API `/cost` dengan:
  - `origin`: kota asal gudang iLook Fashion
  - `destination`: kota tujuan pembeli
  - `weight`: total berat pesanan (gram)
  - `courier`: JNE, J&T, SiCepat, Anteraja, Pos, dll.
- Tampilkan daftar pilihan layanan dengan harga dan estimasi tiba
- Pembeli memilih satu layanan

#### Checkout — Step 3: Pembayaran
- Tampilkan ringkasan pesanan (item, ongkir, total)
- Input kode voucher/diskon (jika ada)
- Pilih metode pembayaran (dari Midtrans)
- Tombol "Bayar Sekarang"

#### Checkout — Step 4: Konfirmasi
- Pesanan berhasil dibuat dengan status `pending_payment`
- Pembeli diarahkan ke halaman instruksi pembayaran / snap Midtrans
- Setelah pembayaran, kembali ke halaman `/pesanan/[order_id]/sukses`

---

### 6.5 Integrasi Ginee

> Ginee adalah platform OMS (Order Management System) dan WMS (Warehouse Management System) omnichannel yang menghubungkan toko web iLook Fashion dengan marketplace lain.

#### 6.5.1 Autentikasi Ginee
- OAuth2 client credentials flow
- Token disimpan di database, auto-refresh sebelum expired
- Implementasi di `GineeService.php`

```php
// GineeService.php
class GineeService
{
    public function getToken(): string
    {
        return Cache::remember('ginee_token', 3500, function () {
            $response = Http::post($this->baseUrl . '/oauth/token', [
                'grant_type'    => 'client_credentials',
                'client_id'     => config('services.ginee.client_id'),
                'client_secret' => config('services.ginee.client_secret'),
            ]);
            return $response->json('access_token');
        });
    }
}
```

#### 6.5.2 Sinkronisasi Produk

| Arah | Trigger | Deskripsi |
|---|---|---|
| Platform → Ginee | Saat produk dibuat/diubah | Push data produk ke Ginee |
| Ginee → Platform | Webhook dari Ginee | Terima update produk/stok dari Ginee |
| Manual | Tombol "Sync dari Ginee" di admin | Tarik semua produk dari Ginee |

**Endpoint Ginee yang digunakan:**
```
POST  /openapi/product/create       Push produk baru ke Ginee
PUT   /openapi/product/update       Update produk di Ginee
GET   /openapi/product/list         Tarik daftar produk dari Ginee
POST  /openapi/stock/update         Update stok di Ginee
GET   /openapi/stock/query          Cek stok di Ginee
```

**Mapping field Produk:**
```
iLook Field       →   Ginee Field
name              →   productName
sku               →   sellerSku
price             →   sellingPrice
weight            →   weight
stock             →   stockNum
images            →   images[].url
status            →   status (LIVE / INACTIVE)
```

#### 6.5.3 Sinkronisasi Pesanan

- Saat pesanan dibuat di toko dan pembayaran berhasil → push ke Ginee OMS
- Ginee memproses fulfillment (picking, packing, handover ke kurir)
- Ginee kirim update status via webhook → platform update status pesanan
- Nomor resi dari Ginee otomatis masuk ke halaman pesanan pembeli

**Status mapping:**
```
Ginee Status          →  iLook Status
PENDING               →  pending_payment
AWAITING_SHIPMENT     →  paid / processing
SHIPPED               →  shipped
DELIVERED             →  delivered
CANCELLED             →  cancelled
```

#### 6.5.4 Webhook dari Ginee

Laravel menerima webhook di endpoint:
```
POST /api/webhooks/ginee
```

Handler melakukan validasi signature, lalu memproses event:
```php
// routes/api.php
Route::post('/webhooks/ginee', [GineeWebhookController::class, 'handle']);

// GineeWebhookController.php
public function handle(Request $request)
{
    // Validasi HMAC signature
    $signature = hash_hmac('sha256', $request->getContent(), config('services.ginee.secret'));
    if ($signature !== $request->header('X-Ginee-Signature')) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    $event = $request->input('eventType');
    match ($event) {
        'ORDER_STATUS_UPDATE'  => $this->handleOrderUpdate($request->input('data')),
        'STOCK_UPDATE'         => $this->handleStockUpdate($request->input('data')),
        'PRODUCT_UPDATE'       => $this->handleProductUpdate($request->input('data')),
        default                => null,
    };

    return response()->json(['status' => 'ok']);
}
```

---

### 6.6 Integrasi Raja Ongkir

> Raja Ongkir menyediakan API untuk mengecek ongkos kirim dari berbagai kurir Indonesia secara real-time.

#### 6.6.1 Konfigurasi

- Gunakan paket **Pro** atau **Starter** (tergantung kebutuhan kurir)
- API Key disimpan di `.env` sebagai `RAJAONGKIR_API_KEY`
- Asal pengiriman: kota gudang iLook Fashion dikonfigurasi di admin (sekali setup)
- Cache hasil kalkulasi ongkir: **Redis TTL 10 menit** (kurangi hit API berulang)

#### 6.6.2 Endpoint yang Digunakan

| Endpoint | Method | Fungsi | Kapan Dipanggil |
|---|---|---|---|
| `/starter/province` | GET | Daftar provinsi | Setup awal, cached selamanya |
| `/starter/city` | GET | Daftar kota/kabupaten | Input alamat checkout, cached 24 jam |
| `/starter/cost` | POST | Kalkulasi ongkir | Tiap pemilihan pengiriman di checkout |
| `/starter/waybill` | POST | Tracking resi | Halaman detail pesanan |

#### 6.6.3 Implementasi Service

```php
// RajaOngkirService.php
class RajaOngkirService
{
    public function getCities(): array
    {
        return Cache::remember('rajaongkir_cities', 86400, function () {
            return Http::withHeaders(['key' => config('services.rajaongkir.api_key')])
                ->get($this->baseUrl . '/city')
                ->json('rajaongkir.results');
        });
    }

    public function calculateCost(int $origin, int $destination, int $weight, string $courier): array
    {
        $cacheKey = "ongkir_{$origin}_{$destination}_{$weight}_{$courier}";
        return Cache::remember($cacheKey, 600, function () use ($origin, $destination, $weight, $courier) {
            return Http::withHeaders(['key' => config('services.rajaongkir.api_key')])
                ->post($this->baseUrl . '/cost', [
                    'origin'      => $origin,
                    'destination' => $destination,
                    'weight'      => $weight,
                    'courier'     => $courier,
                ])
                ->json('rajaongkir.results');
        });
    }

    public function trackWaybill(string $waybill, string $courier): array
    {
        return Http::withHeaders(['key' => config('services.rajaongkir.api_key')])
            ->post($this->baseUrl . '/waybill', [
                'waybill' => $waybill,
                'courier' => $courier,
            ])
            ->json('rajaongkir.result');
    }
}
```

#### 6.6.4 Kurir yang Didukung (Starter Plan)

`jne` · `pos` · `tiki` · `wahana` · `sicepat` · `jnt` · `anteraja` · `ninja` · `lion` · `idexpress`

> Untuk kurir lebih lengkap (30+), upgrade ke Raja Ongkir Pro.

#### 6.6.5 Logika Berat

- Berat per item diambil dari database produk (gram)
- Total berat = Σ (berat_per_item × jumlah)
- Jika total berat < 1000 gram → dibulatkan ke 1000 gram (minimum 1 kg untuk sebagian besar kurir)
- Berat volumetrik = (panjang × lebar × tinggi) / 5000 — digunakan jika lebih besar dari berat fisik

---

### 6.7 Integrasi Payment Gateway

> **Primary Gateway: Midtrans** (karena paling banyak digunakan di Indonesia dan mendukung Snap UI yang mudah diintegrasikan dengan React)

#### 6.7.1 Metode Pembayaran yang Didukung

| Kategori | Metode |
|---|---|
| **Virtual Account** | BCA, BNI, BRI, Mandiri, Permata |
| **E-Wallet** | GoPay, OVO, Dana, ShopeePay |
| **QRIS** | Semua aplikasi dompet digital |
| **Kartu Kredit/Debit** | Visa, Mastercard |
| **Gerai Ritel** | Alfamart, Indomaret |
| **Paylater** | Akulaku (opsional) |

#### 6.7.2 Alur Pembayaran dengan Midtrans Snap

```
1. Pembeli klik "Bayar Sekarang"
        ↓
2. React POST ke Laravel: /api/orders/{id}/payment/initiate
        ↓
3. Laravel buat transaksi di Midtrans:
   POST https://app.midtrans.com/snap/v1/transactions
   Body: { order_id, gross_amount, items, customer_details }
        ↓
4. Midtrans kembalikan snap_token
        ↓
5. React load Midtrans Snap.js dan buka popup pembayaran
   window.snap.pay(snap_token, { callbacks })
        ↓
6. Pembeli selesaikan pembayaran di popup Midtrans
        ↓
7. Midtrans kirim webhook ke: POST /api/webhooks/midtrans
        ↓
8. Laravel validasi signature, update status pesanan
        ↓
9. Laravel push pesanan ke Ginee (jika belum)
        ↓
10. Laravel kirim notifikasi ke pembeli (email + WA)
```

#### 6.7.3 Implementasi Backend

```php
// PaymentService.php
class PaymentService
{
    public function createSnapToken(Order $order): string
    {
        \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production');

        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => $order->total_amount,
            ],
            'item_details' => $order->items->map(fn($item) => [
                'id'       => $item->product_id,
                'price'    => $item->unit_price,
                'quantity' => $item->quantity,
                'name'     => $item->product_name,
            ])->toArray(),
            'customer_details' => [
                'first_name' => $order->buyer_name,
                'email'      => $order->buyer_email,
                'phone'      => $order->buyer_phone,
            ],
        ];

        return \Midtrans\Snap::getSnapToken($params);
    }
}
```

#### 6.7.4 Webhook Midtrans

```php
// MidtransWebhookController.php
public function handle(Request $request)
{
    $serverKey   = config('services.midtrans.server_key');
    $orderId     = $request->input('order_id');
    $statusCode  = $request->input('status_code');
    $grossAmount = $request->input('gross_amount');
    $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

    if ($signatureKey !== $request->input('signature_key')) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    $transactionStatus = $request->input('transaction_status');
    $order = Order::where('order_number', $orderId)->firstOrFail();

    match ($transactionStatus) {
        'settlement', 'capture' => $this->markAsPaid($order),
        'pending'               => $this->markAsPending($order),
        'deny', 'cancel', 'expire' => $this->markAsFailed($order),
        default => null,
    };

    return response()->json(['status' => 'ok']);
}
```

#### 6.7.5 Integrasi React (Frontend)

```jsx
// CheckoutPayment.jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'; // ganti ke prod saat live
  script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
  document.body.appendChild(script);
}, []);

const handlePay = async () => {
  const { snap_token } = await api.post(`/orders/${orderId}/payment/initiate`);
  window.snap.pay(snap_token, {
    onSuccess: (result) => navigate(`/pesanan/${orderId}/sukses`),
    onPending: (result) => navigate(`/pesanan/${orderId}/pending`),
    onError:   (result) => showError('Pembayaran gagal, coba lagi.'),
    onClose:   ()       => console.log('Popup ditutup pembeli'),
  });
};
```

#### 6.7.6 Keamanan Pembayaran

- Semua transaksi via HTTPS
- Data kartu tidak pernah menyentuh server iLook (PCI DSS via Midtrans)
- Validasi signature webhook setiap notifikasi masuk
- Idempotency: cek `order_number` unik sebelum update status (hindari double processing)
- Log semua transaksi di tabel `payment_logs`

---

### 6.8 Manajemen Pesanan

#### Status Pesanan

```
pending_payment → paid → processing → shipped → delivered
                                              ↘ cancelled
                                              ↘ returned
```

#### Fitur Admin (iLook Fashion)
- Daftar semua pesanan dengan filter: status, tanggal, metode bayar, kurir
- Detail pesanan: item, pembeli, alamat, info pembayaran, info pengiriman
- Input nomor resi manual (jika Ginee tidak otomatis)
- Update status manual (jika diperlukan)
- Cetak invoice (PDF) dan label pengiriman
- Proses retur: ubah status ke `returned`, proses refund manual via Midtrans dashboard

#### Fitur Pembeli
- Halaman "Pesanan Saya" (`/akun/pesanan`)
- Detail pesanan dengan timeline status
- Tracking resi via Raja Ongkir API (`/waybill`)
- Tombol "Hubungi Toko" (link ke WhatsApp iLook Fashion)

#### Endpoint
```
GET    /api/admin/orders              # Daftar pesanan (admin)
GET    /api/admin/orders/{id}         # Detail pesanan (admin)
PATCH  /api/admin/orders/{id}/status  # Update status manual
POST   /api/admin/orders/{id}/resi    # Input nomor resi
GET    /api/orders                    # Pesanan milik pembeli yang login
GET    /api/orders/{id}               # Detail pesanan pembeli
GET    /api/orders/{id}/tracking      # Tracking resi via Raja Ongkir
```

---

### 6.9 Notifikasi

#### Email (via Mailgun atau SMTP Gmail)

| Event | Penerima | Isi |
|---|---|---|
| Pesanan baru | Pembeli | Konfirmasi pesanan + detail item + instruksi bayar |
| Pembayaran berhasil | Pembeli | Konfirmasi pembayaran diterima |
| Pesanan dikirim | Pembeli | Nomor resi + kurir |
| Pesanan diterima | Pembeli | Konfirmasi selesai + ajakan review |
| Pesanan baru | Admin (iLook) | Notifikasi ada pesanan masuk |
| Stok kritis | Admin (iLook) | Peringatan stok hampir habis |

#### WhatsApp (via WhatsApp Business Cloud API)

| Event | Penerima | Template |
|---|---|---|
| Pembayaran berhasil | Pembeli | "Halo [nama], pesanan #[id] sudah kami terima..." |
| Pesanan dikirim | Pembeli | "Pesanan kamu sudah dikirim via [kurir], no resi: [resi]..." |

Implementasi menggunakan **Laravel Notification** dengan dua channel: `mail` dan custom `whatsapp`.

```php
// OrderShippedNotification.php
class OrderShippedNotification extends Notification
{
    public function via($notifiable): array
    {
        return ['mail', WhatsAppChannel::class];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pesanan Kamu Sudah Dikirim! 🎉')
            ->markdown('emails.order.shipped', ['order' => $this->order]);
    }

    public function toWhatsApp($notifiable): WhatsAppMessage
    {
        return (new WhatsAppMessage)
            ->template('order_shipped')
            ->params([$notifiable->name, $this->order->tracking_number]);
    }
}
```

---

### 6.10 Dashboard Admin

Halaman admin di React (`/admin/*`) dilindungi middleware Sanctum.

#### Halaman Utama (`/admin`)
- Ringkasan hari ini: total pesanan, total pendapatan, pesanan baru, stok kritis
- Grafik penjualan 7 hari terakhir (chart.js atau Recharts)
- Daftar 5 pesanan terbaru

#### Halaman Produk (`/admin/produk`)
- Tabel produk dengan pencarian dan filter status
- Tombol sync ke/dari Ginee
- Bulk actions: aktifkan, nonaktifkan, hapus

#### Halaman Pesanan (`/admin/pesanan`)
- Tabel pesanan dengan filter lengkap
- Export CSV

#### Halaman Pengaturan Toko (`/admin/pengaturan`)
- Info toko: nama, logo, nomor HP admin, alamat gudang (kota asal pengiriman)
- Kurir aktif yang ditampilkan di checkout
- Banner beranda
- Konfigurasi batas minimum stok alert

#### Halaman Laporan (`/admin/laporan`)
- Laporan penjualan: filter per periode
- Top produk terlaris
- Export Excel/CSV

---

## 7. Persyaratan Non-Fungsional

### 7.1 Performa

| Metrik | Target |
|---|---|
| Page load storefront (LCP) | < 2.5 detik |
| API response time (p95) | < 500ms |
| Waktu kalkulasi ongkir | < 2 detik (termasuk cache miss) |
| Uptime | ≥ 99.5% per bulan |
| Concurrent users | Minimal 500 tanpa degradasi |

### 7.2 Keamanan

- **HTTPS wajib** di semua halaman (SSL via Let's Encrypt)
- **CORS** dikonfigurasi ketat: hanya domain `ilookfashion.com` yang diizinkan
- **Rate limiting** pada semua endpoint API (60 req/menit untuk publik, 300 untuk admin)
- **SQL Injection**: gunakan Eloquent ORM dan prepared statements
- **XSS**: sanitasi input, escape output, CSP header
- **CSRF**: Laravel Sanctum dengan SPA mode
- **Webhook signature validation**: semua webhook divalidasi sebelum diproses

### 7.3 SEO (Storefront)

- Server-Side Rendering (SSR) untuk halaman produk dan kategori → gunakan **Laravel Blade** sebagai fallback atau **React dengan SSR via Inertia.js / Next.js** jika diperlukan SEO kuat
- Meta tag dinamis per halaman produk (title, description, og:image)
- Sitemap XML otomatis (`/sitemap.xml`)
- URL produk SEO-friendly: `/produk/nama-produk-slug`

> **Catatan:** Jika SEO adalah prioritas tinggi, pertimbangkan mengganti React SPA menjadi **Inertia.js** (React + Laravel tapi SSR) atau tetap React SPA dengan static meta tag yang di-generate server-side.

### 7.4 Responsivitas

- Tampilan optimal di mobile (min 360px), tablet (768px), dan desktop (1280px+)
- Mobile-first design dengan Tailwind CSS breakpoints
- Touch-friendly UI untuk elemen interaktif (tombol min 44×44px)

---

## 8. User Stories

### Pembeli

| ID | Story | Prioritas |
|---|---|---|
| B-01 | Sebagai pembeli, saya ingin melihat daftar produk fashion iLook dengan foto dan harga yang jelas | Must Have |
| B-02 | Sebagai pembeli, saya ingin memilih ukuran dan warna produk sebelum menambahkan ke keranjang | Must Have |
| B-03 | Sebagai pembeli, saya ingin tahu estimasi ongkos kirim ke kota saya sebelum checkout | Must Have |
| B-04 | Sebagai pembeli, saya ingin membayar dengan GoPay atau transfer bank sesuai kenyamanan saya | Must Have |
| B-05 | Sebagai pembeli, saya ingin menerima konfirmasi pesanan via email dan WhatsApp | Must Have |
| B-06 | Sebagai pembeli, saya ingin melacak status pengiriman pesanan saya dengan nomor resi | Should Have |
| B-07 | Sebagai pembeli, saya ingin menyimpan alamat pengiriman agar tidak perlu input ulang | Should Have |
| B-08 | Sebagai pembeli, saya ingin melihat riwayat pesanan saya di halaman akun | Should Have |

### Admin (iLook Fashion)

| ID | Story | Prioritas |
|---|---|---|
| A-01 | Sebagai admin, saya ingin menambah produk baru dengan foto, varian ukuran, dan stok | Must Have |
| A-02 | Sebagai admin, saya ingin stok di toko web otomatis sinkron dengan Ginee agar tidak overselling | Must Have |
| A-03 | Sebagai admin, saya ingin melihat semua pesanan masuk dan mengubah statusnya | Must Have |
| A-04 | Sebagai admin, saya ingin pesanan yang sudah dibayar otomatis dikirim ke Ginee untuk diproses | Must Have |
| A-05 | Sebagai admin, saya ingin mendapat notifikasi WhatsApp saat ada pesanan baru | Must Have |
| A-06 | Sebagai admin, saya ingin mendapat peringatan saat stok produk hampir habis | Should Have |
| A-07 | Sebagai admin, saya ingin mengekspor laporan penjualan bulanan ke Excel | Should Have |
| A-08 | Sebagai admin, saya ingin mengubah banner beranda toko tanpa perlu coding | Should Have |

---

## 9. Alur Sistem (Flow)

### 9.1 Alur Pembelian Lengkap

```
Pembeli buka toko ilookfashion.com
        ↓
Pilih produk → pilih varian → klik "Tambah ke Keranjang"
        ↓
Buka halaman Keranjang → klik "Checkout"
        ↓
Step 1: Input / pilih alamat pengiriman
        ↓
Step 2: Sistem panggil Raja Ongkir API → tampilkan pilihan kurir + ongkir
Pembeli pilih kurir
        ↓
Step 3: Pilih metode pembayaran → klik "Bayar Sekarang"
        ↓
Laravel buat pesanan (status: pending_payment)
Laravel panggil Midtrans → dapat snap_token
React buka popup Midtrans Snap
        ↓
Pembeli bayar di popup Midtrans
        ↓
Midtrans kirim webhook → Laravel terima, validasi, update status → paid
        ↓
Laravel dispatch job:
  - Push pesanan ke Ginee OMS
  - Kirim email konfirmasi ke pembeli
  - Kirim WA notifikasi ke pembeli
  - Kirim WA notifikasi ke admin iLook
        ↓
Admin iLook proses pesanan di Ginee
Ginee update status → webhook ke Laravel → status: shipped + no resi
        ↓
Laravel kirim notifikasi "pesanan dikirim" ke pembeli
        ↓
Pembeli terima paket → status: delivered
```

### 9.2 Alur Sinkronisasi Stok

```
Admin tambah/edit stok produk di Admin Panel iLook
        ↓
Laravel update stok di database
        ↓
Laravel panggil Ginee API: POST /openapi/stock/update
        ↓
Ginee sinkronkan stok ke semua marketplace yang terhubung
(Tokopedia, Shopee, dll.)
        ↓
Jika stok berubah dari marketplace (penjualan di Tokopedia misalnya):
Ginee kirim webhook ke Laravel → Laravel update stok di database iLook
```

---

## 10. Struktur Database (Ringkasan)

### Tabel Utama

```sql
-- Users (pembeli & admin)
users: id, name, email, password, phone, role (admin|buyer), email_verified_at

-- Alamat pembeli
addresses: id, user_id, label, recipient_name, phone, address, city_id, province_id, postal_code, is_default

-- Kategori produk
categories: id, name, slug, parent_id, image_url, sort_order

-- Produk
products: id, category_id, name, slug, description, sku, weight, length, width, height,
          base_price, sale_price, status, ginee_product_id, created_at

-- Foto produk
product_images: id, product_id, url, sort_order, is_primary

-- Atribut varian (Ukuran, Warna)
attributes: id, name          -- contoh: "Ukuran", "Warna"
attribute_values: id, attribute_id, value  -- contoh: "S", "M", "Hitam", "Putih"

-- Varian produk
product_variants: id, product_id, sku, price, stock, ginee_variant_id
variant_attribute_values: id, variant_id, attribute_value_id

-- Riwayat stok
stock_logs: id, product_variant_id, before, after, reason, created_at

-- Pesanan
orders: id, order_number, user_id, status, subtotal, shipping_cost, total_amount,
        payment_method, payment_status, snap_token, ginee_order_id

-- Item pesanan
order_items: id, order_id, product_variant_id, product_name, variant_label,
             unit_price, quantity, subtotal

-- Info pengiriman pesanan
order_shippings: id, order_id, courier, service, courier_name, tracking_number,
                 rajaongkir_city_id, recipient_name, phone, address, city, province, postal_code

-- Log pembayaran
payment_logs: id, order_id, transaction_id, status, amount, raw_response, created_at

-- Banner beranda
banners: id, title, image_url, link_url, sort_order, is_active

-- Konfigurasi toko
settings: key, value   -- contoh: origin_city_id, min_stock_alert, whatsapp_number
```

---

## 11. Rencana Pengembangan

### Timeline (Estimasi)

| Fase | Durasi | Deliverable |
|---|---|---|
| **Fase 0: Setup** | 1 minggu | Inisialisasi proyek Laravel + React, setup CI/CD, buat akun semua vendor API |
| **Fase 1: Core** | 5 minggu | Auth, CRUD produk, storefront, kategori, keranjang |
| **Fase 2: Checkout** | 3 minggu | Integrasi Raja Ongkir + Midtrans, alur checkout end-to-end |
| **Fase 3: Ginee** | 3 minggu | Sinkronisasi produk, stok, dan pesanan dua arah |
| **Fase 4: Notifikasi & Admin** | 2 minggu | Email + WA notifikasi, dashboard laporan, export |
| **Fase 5: QA & Launch** | 2 minggu | Testing menyeluruh, UAT, optimasi performa, go live |
| **Total** | **~16 minggu** | Full launch |

### Prioritas Fitur (MoSCoW)

#### 🔴 Must Have
- Registrasi/login pembeli
- CRUD produk + varian + foto
- Storefront (beranda, produk, kategori)
- Keranjang + checkout
- Integrasi Raja Ongkir (kalkulasi ongkir)
- Integrasi Midtrans (VA Bank + GoPay + QRIS)
- Sinkronisasi Ginee (produk + stok + pesanan)
- Notifikasi email pesanan
- Admin panel dasar (produk, pesanan, pengaturan)

#### 🟡 Should Have
- Tracking resi Raja Ongkir
- Notifikasi WhatsApp
- Halaman akun pembeli + riwayat pesanan
- Laporan penjualan + export CSV
- Kartu kredit via Midtrans
- Alert stok kritis

#### 🟢 Could Have
- Voucher diskon
- Ulasan produk
- SEO lanjutan (sitemap, structured data)
- Google Analytics / Meta Pixel
- Paylater (Akulaku)
- Gerai ritel (Alfamart, Indomaret)

#### ⚪ Won't Have (Fase Ini)
- Aplikasi mobile native
- Multi-toko
- Livestream commerce
- Fitur affiliate

---

## 12. Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| Ginee API downtime | Tinggi | Sedang | Circuit breaker di `GineeService`, antrian retry otomatis via Laravel Queue, pesanan tetap masuk ke database iLook |
| Raja Ongkir API lambat/error | Sedang | Sedang | Cache Redis 10 menit, timeout 5 detik, fallback: tampilkan "hubungi toko untuk ongkir" |
| Midtrans pembayaran gagal | Tinggi | Rendah | Retry logic, pesanan tetap tersimpan dengan status `pending_payment`, pembeli bisa bayar ulang |
| Webhook tidak diterima | Tinggi | Rendah | Scheduled job setiap 5 menit cek status transaksi ke Midtrans API secara proaktif |
| Stok tidak sinkron (overselling) | Tinggi | Sedang | Validasi stok real-time saat checkout (bukan hanya saat tambah ke keranjang), lock stok saat proses checkout |
| Perubahan API vendor tanpa notifikasi | Sedang | Rendah | Abstraction layer di Services, subscribe changelog Ginee/RajaOngkir/Midtrans |

---

## 13. Kriteria Penerimaan

### MVP Dianggap Selesai Jika:

- [ ] Pembeli dapat browsing produk, memilih varian, dan checkout dalam < 5 menit
- [ ] Kalkulasi ongkir Raja Ongkir tampil dengan benar di halaman checkout
- [ ] Pembayaran via Virtual Account dan GoPay berhasil diproses end-to-end
- [ ] Status pesanan terupdate otomatis setelah pembayaran (tanpa refresh manual)
- [ ] Pesanan berbayar otomatis masuk ke Ginee OMS dalam < 60 detik
- [ ] Stok di toko web berkurang saat pesanan berhasil dibayar
- [ ] Email konfirmasi terkirim ke pembeli dalam < 2 menit setelah pembayaran
- [ ] Admin dapat melihat semua pesanan di admin panel
- [ ] Tidak ada bug kritis (P0) yang belum ditangani
- [ ] Performa storefront: LCP < 2.5 detik pada jaringan 4G

### Definition of Done per Fitur:
- [ ] Kode sudah melalui code review
- [ ] Unit test ada untuk business logic kritikal (terutama Services)
- [ ] Endpoint API terdokumentasi (minimal komentar PHPDoc atau file Postman collection)
- [ ] Fitur sudah ditest di staging environment
- [ ] Tidak ada console error di frontend

---

## 14. Lampiran & Referensi

### Dokumentasi API Vendor

| Vendor | URL Dokumentasi | Sandbox |
|---|---|---|
| **Ginee** | https://developer.ginee.com/docs | Tersedia |
| **Raja Ongkir** | https://rajaongkir.com/dokumentasi | Starter (gratis) |
| **Midtrans Snap** | https://docs.midtrans.com/docs/snap-overview | https://app.sandbox.midtrans.com |
| **WhatsApp Business** | https://developers.facebook.com/docs/whatsapp/cloud-api | Tersedia |

### Package Laravel yang Direkomendasikan

```bash
# Midtrans
composer require midtrans/midtrans-php

# HTTP Client (sudah bawaan Laravel)
# Guzzle via Http::

# PDF Invoice
composer require barryvdh/laravel-dompdf

# Excel/CSV Export
composer require maatwebsite/excel

# Image Optimization
composer require intervention/image
```

### Package React yang Direkomendasikan

```bash
npm install axios react-query @tanstack/react-query
npm install react-router-dom
npm install tailwindcss
npm install recharts          # Chart dashboard
npm install react-hook-form   # Form handling
npm install zod               # Validasi form
npm install @headlessui/react # UI components accessible
npm install react-hot-toast   # Notifikasi toast
npm install dayjs             # Date formatting
```

### Glosarium

| Istilah | Definisi |
|---|---|
| **OMS** | Order Management System — sistem pengelolaan pesanan dari berbagai channel |
| **WMS** | Warehouse Management System — sistem pengelolaan stok dan gudang |
| **Snap Token** | Token unik dari Midtrans untuk membuka popup pembayaran |
| **Webhook** | Notifikasi HTTP otomatis dari sistem eksternal saat suatu event terjadi |
| **Virtual Account** | Nomor rekening virtual unik per transaksi untuk pembayaran transfer bank |
| **QRIS** | Quick Response Code Indonesian Standard — standar QR pembayaran nasional Bank Indonesia |
| **SKU** | Stock Keeping Unit — kode unik per varian produk untuk manajemen inventori |
| **SPA** | Single Page Application — aplikasi web yang berjalan di satu halaman HTML dengan navigasi dinamis |
| **SSR** | Server-Side Rendering — halaman di-render di server sebelum dikirim ke browser (penting untuk SEO) |
| **TTL** | Time To Live — durasi data tersimpan di cache sebelum kadaluarsa |
| **p95** | Persentil ke-95 — 95% request selesai dalam waktu ≤ nilai ini |

---

*Dokumen ini dibuat untuk iLook Fashion. Bersifat internal dan dapat diperbarui seiring perkembangan proyek.*

*Versi 1.0 — 17 Juni 2026*