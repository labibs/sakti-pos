"use server";

import { auth } from "@clerk/nextjs/server";

const API_BASE = "https://core.sakte.id/api";

async function serverFetch(path: string, options: RequestInit = {}) {
  const { getToken } = await auth();
  const token = await getToken();

  const cleanPath = path.startsWith("/") ? path : "/" + path;
  const url = `${API_BASE}${cleanPath}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[setting/serverFetch] failed", {
      path,
      status: res.status,
      responseText: text,
    });
    let msg = `Error ${res.status}`;
    try {
      const data = JSON.parse(text);
      msg = data.message || msg;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  return res.json();
}

export async function getMerchantAction() {
  try {
    const res = await serverFetch("/me");
    console.log("[setting/getMerchantAction] success", {
      merchantId: res?.merchant?.id,
      hasProfile: !!res?.merchant?.profile,
    });
    return { success: true, data: res.merchant };
  } catch (e: any) {
    console.error("[setting/getMerchantAction] error", e?.message || e);
    return { success: false, error: e.message };
  }
}

export async function getDashboardDataAction() {
  try {
    const [ordersRes, itemsRes, meRes] = await Promise.all([
      serverFetch("/orders"),
      serverFetch("/catalog/items"),
      serverFetch("/me"),
    ]);

    return {
      success: true,
      data: {
        orders: ordersRes.data || ordersRes,
        items: itemsRes.data || itemsRes,
        merchant: meRes.merchant,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateBrandingAction(formData: {
  name: string;
  logo_url: string;
}) {
  try {
    console.log("[setting/updateBrandingAction] request", {
      name: formData.name,
      logoLength: formData.logo_url?.length || 0,
      logoPrefix: formData.logo_url?.slice(0, 40) || "",
    });
    const res = await serverFetch("/merchant/current/setting", {
      method: "PUT",
      body: JSON.stringify(formData),
    });
    console.log("[setting/updateBrandingAction] success", {
      merchantId: res?.id,
      logoUrl: res?.profile?.logo_url,
    });
    return { success: true, data: res };
  } catch (e: any) {
    console.error("[setting/updateBrandingAction] error", e?.message || e);
    return { success: false, error: e.message };
  }
}
