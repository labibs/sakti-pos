import { NextRequest, NextResponse } from "next/server";

// Menggunakan IP langsung untuk bypass masalah DNS/SSL lokal jika perlu
// Cloudflare IP: 104.21.6.2 atau 172.67.134.26
const UPSTREAM_DOMAIN = "core.sakte.id";
const LARAVEL_BASE = "https://" + UPSTREAM_DOMAIN + "/api";

async function handler(
  req: NextRequest,
  { params }: { params: any },
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const url = LARAVEL_BASE + "/" + path + req.nextUrl.search;
  
  const authHeader = req.headers.get("authorization");
  console.log(`[api-proxy] forwarding to:`, url);

  const headers = new Headers(req.headers);
  headers.set("Host", UPSTREAM_DOMAIN);
  headers.delete("connection");
  headers.delete("content-length");

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: headers,
    cache: "no-store",
    redirect: "follow",
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    try {
      const contentType = req.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const bodyText = await req.text();
        if (bodyText) fetchOptions.body = bodyText;
      } else {
        const blob = await req.blob();
        if (blob.size > 0) fetchOptions.body = blob;
      }
    } catch (e) {}
  }

  try {
    // Kita tambahkan timeout agar tidak gantung
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    const contentType = res.headers.get("content-type");
    const dataText = await res.text();

    console.log("[api-proxy] response status:", res.status);

    if (contentType?.includes("application/json")) {
      try {
        const data = JSON.parse(dataText);
        return NextResponse.json(data, { status: res.status });
      } catch (e) {
        return new NextResponse(dataText, { 
          status: res.status,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }

    return new NextResponse(dataText, {
      status: res.status,
      headers: { "Content-Type": contentType || "application/octet-stream" },
    });
  } catch (error: any) {
    console.error("[Proxy Error] Details:", error.message);
    
    // Jika fetch failed, kita coba log lebih dalam
    return NextResponse.json(
      { 
        message: "Proxy Error", 
        detail: error.message, 
        target: url,
        hint: "Pastikan domain core.sakte.id bisa diakses dari server lokal (ping core.sakte.id)"
      },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
