# Laravel API Generated Package

Paket ini dibuat untuk dipindahkan ke project Laravel API yang sudah ada di hosting.

## Isi

- `pos_core.sql`: SQL untuk import lewat phpMyAdmin.
- `routes/api.php`: route API core POS modular.
- `app/Models/*`: model Eloquent per tabel.
- `app/Http/Controllers/Api/*`: controller API.

## Cara Pasang Singkat

1. Backup database hosting dulu.
2. Import `pos_core.sql` lewat phpMyAdmin.
3. Copy folder `app/Models` ke `app/Models` Laravel.
4. Copy folder `app/Http/Controllers/Api` ke `app/Http/Controllers/Api`.
5. Merge isi `routes/api.php` ke route API Laravel yang sudah ada.
6. Sesuaikan middleware auth:
   - default file ini pakai `auth:sanctum`
   - kalau project memakai Clerk/JWT custom, ganti ke middleware yang sesuai.

## Header API

Frontend sebaiknya mengirim:

```http
Authorization: Bearer <token>
X-Merchant-Id: <merchant_id>
```

`X-Merchant-Id` dipakai supaya backend tahu data merchant mana yang aktif untuk user login.

## Flow POS Core

```text
GET  /api/catalog/items
POST /api/orders
POST /api/orders/{order}/items
POST /api/orders/{order}/close-bill
POST /api/orders/{order}/checkout
GET  /api/sales/{sale}/receipt
POST /api/documents/{document}/send-whatsapp
POST /api/documents/{document}/send-email
POST /api/documents/{document}/print-log
```

## Catatan

Controller WhatsApp/email masih berupa delivery log. Integrasi provider WhatsApp dan mailer PDF bisa ditambahkan setelah credential/provider dipilih.
