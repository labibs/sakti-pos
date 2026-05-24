# Sakti POS PWA

Project Next.js untuk aplikasi POS berbasis PWA, login memakai Clerk, dan backend Laravel API.

## Setup Frontend

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Di dashboard Clerk, set URL berikut:

```text
Sign-in URL: /sign-in
Sign-up URL: /sign-up
After sign-in URL: /pos
After sign-up URL: /pos
```

## Backend Laravel

Copy `laravel/api.php` ke `routes/api.php` di project Laravel.

Frontend akan mengirim request seperti ini:

```http
Authorization: Bearer <clerk_jwt>
Accept: application/json
Content-Type: application/json
```

Minimal backend perlu:

- Middleware `auth.clerk` untuk validasi Clerk JWT.
- Kolom `clerk_user_id` pada tabel `users`.
- Controller untuk `ProductController`, `SaleController`, `DashboardController`, dan resource lain di route.
- CORS mengizinkan origin `http://localhost:3000`.

## Struktur Penting

- `app/pos/page.tsx`: halaman kasir utama.
- `components/pos-register.tsx`: UI keranjang, pencarian produk, dan checkout.
- `lib/api.ts`: API client ke Laravel.
- `public/manifest.webmanifest`: manifest PWA.
- `public/sw.js`: service worker offline fallback.
- `middleware.ts`: proteksi route memakai Clerk.

## Endpoint Utama

```text
GET    /api/dashboard/summary
GET    /api/products
POST   /api/products
POST   /api/sales
GET    /api/sales/{sale}
POST   /api/sales/{sale}/refund
GET    /api/reports/sales
```
