export type ItemType =
  | "product"
  | "service"
  | "package"
  | "ticket"
  | "shipment"
  | "rental"
  | "custom";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api-proxy";

interface ApiOptions extends RequestInit {
  token?: string | null;
  useCache?: boolean;
  cacheKey?: string;
  ttl?: number;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, headers, useCache, cacheKey, ttl, ...init } = options;
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  const url = API_BASE_URL + cleanPath;

  // 1. Check Cache if requested (Only for GET requests)
  const isGet = !init.method || init.method.toUpperCase() === "GET";
  const storageKey =
    cacheKey || `api_cache:${cleanPath}${token ? ":auth" : ""}`;

  if (useCache && isGet && typeof window !== "undefined") {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        const { data, expiry } = JSON.parse(cached);
        // If not expired, return immediately
        if (expiry > Date.now()) {
          // console.log(`[Cache Hit] ${cleanPath}`);
          return data as T;
        }
      } catch (e) {
        console.warn("Cache parse failed", e);
      }
    }
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...headers,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    let msg = "Error " + response.status;
    try {
      const data = JSON.parse(text);
      msg = data.detail || data.message || msg;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  try {
    const data = JSON.parse(text);

    // 2. Save to Cache if requested (Only for GET requests)
    if (useCache && isGet && typeof window !== "undefined") {
      const cacheTTL = ttl || 1000 * 60 * 15; // 15 minutes default cache
      const expiry = Date.now() + cacheTTL;
      localStorage.setItem(storageKey, JSON.stringify({ data, expiry }));
    }

    return data;
  } catch {
    return {} as T;
  }
}

export const demoProducts: Product[] = [
  {
    id: 1,
    name: "Kopi Susu",
    sku: "KOP-001",
    category: "Minuman",
    price: 18000,
    stock: 42,
  },
  {
    id: 2,
    name: "Nasi Goreng",
    sku: "MKN-001",
    category: "Makanan",
    price: 28000,
    stock: 24,
  },
  {
    id: 3,
    name: "Paket Hemat",
    sku: "PKT-001",
    category: "Paket Promo",
    price: 35000,
    stock: 16,
  },
  {
    id: 4,
    name: "Air Mineral",
    sku: "MIN-001",
    category: "Minuman",
    price: 6000,
    stock: 80,
  },
];
