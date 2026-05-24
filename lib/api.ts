
export type ItemType = 'product' | 'service' | 'package' | 'ticket' | 'shipment' | 'rental' | 'custom';

export interface CatalogItem {
  id: number;
  merchant_id: number;
  item_type: ItemType;
  name: string;
  sku: string | null;
  base_price: number;
  category?: { name: string };
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  item_type?: ItemType;
  base_price?: number;
}

export const demoProducts: Product[] = [
  { id: 1, name: 'Kopi Susu', sku: 'KOP-001', category: 'Minuman', price: 18000, stock: 42 },
  { id: 2, name: 'Nasi Goreng', sku: 'MKN-001', category: 'Makanan', price: 28000, stock: 24 },
  { id: 3, name: 'Paket Hemat', sku: 'PKT-001', category: 'Paket Promo', price: 35000, stock: 16 },
  { id: 4, name: 'Air Mineral', sku: 'MIN-001', category: 'Minuman', price: 6000, stock: 80 },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://pos.sakte.id/api';

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...init } = options;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const url = API_BASE_URL + cleanPath;

  const response = await fetch(url, {
    ...init,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...headers
    }
  });

  const text = await response.text();
  
  if (!response.ok) {
    let msg = 'Error ' + response.status;
    try { 
      const data = JSON.parse(text); 
      msg = data.message || msg; 
    } catch { 
      if (text) msg = text; 
    }
    throw new Error(msg);
  }

  try { 
    return JSON.parse(text); 
  } catch { 
    return {} as T; 
  }
}
