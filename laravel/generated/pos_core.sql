-- POS Modular Core Schema
-- Import file ini lewat phpMyAdmin pada database Laravel.
-- Asumsi: tabel `users` Laravel sudah ada.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS merchants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  business_type ENUM(
    'restaurant_cafe',
    'warung_retail',
    'workshop_service',
    'laundry',
    'salon_appointment',
    'ticketing',
    'shipment_expedition',
    'general_service'
  ) NOT NULL DEFAULT 'warung_retail',
  status ENUM('pending', 'active', 'inactive', 'suspended', 'rejected') NOT NULL DEFAULT 'pending',
  owner_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_merchants_owner_user_id (owner_user_id),
  CONSTRAINT fk_merchants_owner_user_id FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS merchant_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  logo_url VARCHAR(500) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(150) NULL,
  address TEXT NULL,
  tax_number VARCHAR(100) NULL,
  receipt_footer VARCHAR(255) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_merchant_profiles_merchant_id (merchant_id),
  CONSTRAINT fk_merchant_profiles_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS merchant_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  `key` VARCHAR(120) NOT NULL,
  value_json JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_merchant_settings_key (merchant_id, `key`),
  CONSTRAINT fk_merchant_settings_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS merchant_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role_code VARCHAR(60) NOT NULL DEFAULT 'owner',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_merchant_users (merchant_id, user_id),
  INDEX idx_merchant_users_user_id (user_id),
  CONSTRAINT fk_merchant_users_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_merchant_users_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS modules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  is_core TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_modules_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS merchant_modules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  module_code VARCHAR(80) NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  config_json JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_merchant_modules (merchant_id, module_code),
  CONSTRAINT fk_merchant_modules_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_merchant_modules_module_code FOREIGN KEY (module_code) REFERENCES modules(code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_catalog_categories_merchant_id (merchant_id),
  CONSTRAINT fk_catalog_categories_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_catalog_categories_parent_id FOREIGN KEY (parent_id) REFERENCES catalog_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  item_type ENUM('product', 'service', 'package', 'ticket', 'shipment', 'rental', 'custom') NOT NULL DEFAULT 'product',
  name VARCHAR(180) NOT NULL,
  sku VARCHAR(100) NULL,
  barcode VARCHAR(120) NULL,
  description TEXT NULL,
  base_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
  track_stock TINYINT(1) NOT NULL DEFAULT 0,
  stock_qty DECIMAL(15,3) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  metadata_json JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_catalog_items_merchant_id (merchant_id),
  INDEX idx_catalog_items_name (name),
  INDEX idx_catalog_items_sku (sku),
  INDEX idx_catalog_items_barcode (barcode),
  CONSTRAINT fk_catalog_items_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_catalog_items_category_id FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(150) NULL,
  address TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_customers_merchant_id (merchant_id),
  INDEX idx_customers_phone (phone),
  CONSTRAINT fk_customers_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  order_number VARCHAR(60) NOT NULL,
  business_module VARCHAR(80) NOT NULL DEFAULT 'pos',
  source ENUM('cashier', 'waiter', 'customer_qr', 'admin', 'online', 'api') NOT NULL DEFAULT 'cashier',
  service_type ENUM('dine_in', 'delivery', 'pickup', 'onsite_service', 'counter', 'shipment', 'ticket') NULL,
  order_status ENUM('draft', 'confirmed', 'processing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
  bill_status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  payment_status ENUM('unpaid', 'partial', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  fulfillment_status ENUM('pending', 'in_progress', 'ready', 'fulfilled', 'returned') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  service_charge_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  metadata_json JSON NULL,
  opened_at DATETIME NULL,
  closed_at DATETIME NULL,
  completed_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_orders_order_number (merchant_id, order_number),
  INDEX idx_orders_merchant_status (merchant_id, order_status, bill_status, payment_status),
  CONSTRAINT fk_orders_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  catalog_item_id BIGINT UNSIGNED NULL,
  item_type ENUM('product', 'service', 'package', 'ticket', 'shipment', 'rental', 'custom') NOT NULL DEFAULT 'product',
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  qty DECIMAL(15,3) NOT NULL DEFAULT 1,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  staff_id BIGINT UNSIGNED NULL,
  status ENUM('pending', 'processing', 'ready', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_order_items_order_id (order_id),
  CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_catalog_item_id FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_staff_id FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_histories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  status_type VARCHAR(50) NOT NULL,
  from_status VARCHAR(50) NULL,
  to_status VARCHAR(50) NOT NULL,
  notes TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  INDEX idx_order_status_histories_order_id (order_id),
  CONSTRAINT fk_order_status_histories_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_status_histories_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sales (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  invoice_number VARCHAR(60) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  service_charge_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('draft', 'paid', 'void', 'refunded') NOT NULL DEFAULT 'paid',
  sold_at DATETIME NOT NULL,
  cashier_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_sales_invoice_number (merchant_id, invoice_number),
  INDEX idx_sales_merchant_sold_at (merchant_id, sold_at),
  CONSTRAINT fk_sales_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_sales_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_sales_cashier_id FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sale_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id BIGINT UNSIGNED NOT NULL,
  order_item_id BIGINT UNSIGNED NULL,
  catalog_item_id BIGINT UNSIGNED NULL,
  item_type VARCHAR(30) NOT NULL,
  name VARCHAR(180) NOT NULL,
  qty DECIMAL(15,3) NOT NULL DEFAULT 1,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_sale_items_sale_id FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_items_order_item_id FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_sale_items_catalog_item_id FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  sale_id BIGINT UNSIGNED NOT NULL,
  method ENUM('cash', 'qris', 'transfer', 'card', 'e_wallet', 'cod', 'deposit', 'credit', 'mixed') NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'paid',
  reference_number VARCHAR(120) NULL,
  provider VARCHAR(80) NULL,
  paid_at DATETIME NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_payments_sale_id (sale_id),
  CONSTRAINT fk_payments_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_sale_id FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  sale_id BIGINT UNSIGNED NULL,
  document_type ENUM('receipt', 'invoice', 'ticket', 'shipping_label', 'waybill', 'kitchen_ticket', 'work_order', 'quotation') NOT NULL DEFAULT 'receipt',
  document_number VARCHAR(80) NOT NULL,
  format ENUM('text', 'pdf', 'thermal', 'qr', 'label') NOT NULL DEFAULT 'text',
  status ENUM('draft', 'generated', 'sent', 'failed', 'cancelled') NOT NULL DEFAULT 'generated',
  file_url VARCHAR(500) NULL,
  content_text TEXT NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_documents_number (merchant_id, document_number),
  CONSTRAINT fk_documents_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_sale_id FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_deliveries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT UNSIGNED NOT NULL,
  channel ENUM('print', 'whatsapp', 'email', 'download') NOT NULL,
  recipient VARCHAR(180) NULL,
  status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  sent_at DATETIME NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_document_deliveries_document_id FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO modules (code, name, description, is_core, created_at, updated_at) VALUES
('pos', 'POS Kasir', 'Core checkout dan pembayaran', 1, NOW(), NOW()),
('catalog', 'Catalog', 'Produk, jasa, paket, tiket, shipment item', 1, NOW(), NOW()),
('transactions', 'Transactions', 'Riwayat order, sale, dan payment', 1, NOW(), NOW()),
('receipt', 'Receipt & Document', 'Struk, invoice, tiket, waybill', 1, NOW(), NOW()),
('inventory', 'Inventory', 'Stock dan purchase order', 0, NOW(), NOW()),
('restaurant', 'Restaurant', 'Meja, QR order, kitchen, waiter', 0, NOW(), NOW()),
('workshop', 'Workshop', 'Work order, kendaraan, mekanik', 0, NOW(), NOW()),
('ticketing', 'Ticketing', 'Event, tiket QR, check-in', 0, NOW(), NOW()),
('shipment', 'Shipment', 'Ekspedisi, resi, tracking', 0, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
