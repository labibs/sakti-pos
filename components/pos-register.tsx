"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  Banknote,
  Bike,
  Camera,
  CheckCircle2,
  ChevronRight,
  Coffee,
  CreditCard,
  Loader2,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  ReceiptText,
  Scan,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { apiFetch, type CatalogItem } from "@/lib/api";
import { ProductCard } from "./product-card";
import { useUIStore } from "@/lib/ui-store";
import {
  readStoredIdentity,
  writeStoredIdentity,
} from "@/components/store/use-store-identity";

type CartItem = CatalogItem & { qty: number };

type ReceiptSnapshot = {
  invoiceNumber: string;
  soldAt: string;
  storeName: string;
  serviceLabel: string;
  paymentLabel: string;
  items: CartItem[];
  subtotal: number;
  paidAmount: number;
  changeAmount: number;
  table_id?: string | null;
};

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const serviceTypes = [
  {
    id: "pickup",
    label: "Dibawa Pulang",
    shortLabel: "Takeaway",
    icon: ShoppingBag,
    color: "text-pink-500",
  },
  {
    id: "dine_in",
    label: "Makan di Sini",
    shortLabel: "Dine In",
    icon: Coffee,
    color: "text-blue-500",
  },
  {
    id: "delivery",
    label: "Diantar",
    shortLabel: "Delivery",
    icon: Bike,
    color: "text-orange-500",
  },
];

const paymentMethods = [
  { id: "cash", label: "Tunai", icon: Banknote },
  { id: "qris", label: "QRIS", icon: CreditCard },
  { id: "transfer", label: "Transfer", icon: CreditCard },
];

const rupiahDenominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

function buildPaymentShortcuts(total: number) {
  if (total <= 0) return rupiahDenominations;

  const candidates = new Set<number>([total]);
  const nearestThousand = Math.ceil(total / 1000) * 1000;

  for (let i = 0; i < 9; i += 1) {
    candidates.add(nearestThousand + i * 1000);
  }

  rupiahDenominations.forEach((denomination) => {
    candidates.add(Math.ceil(total / denomination) * denomination);
  });

  [12000, 15000, 25000, 75000, 150000, 200000].forEach((amount) => {
    if (amount >= total) {
      candidates.add(amount);
    }
  });

  return Array.from(candidates)
    .filter((amount) => amount >= total)
    .sort((a, b) => a - b)
    .slice(0, 12);
}

function PosContent() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [lastSale, setLastSale] = useState<any>(null);
  const [receiptSnapshot, setReceiptSnapshot] =
    useState<ReceiptSnapshot | null>(null);
  const [receiptChannel, setReceiptChannel] = useState<
    "print" | "whatsapp" | "email"
  >("print");
  const [receiptWhatsapp, setReceiptWhatsapp] = useState("");
  const [receiptEmail, setReceiptEmail] = useState("");
  const [query, setQuery] = useState("");
  const [noMerchant, setNoMerchant] = useState(false);
  const [serviceType, setServiceType] = useState("dine_in");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [storeName, setStoreName] = useState(
    () => readStoredIdentity().storeName,
  );
  const [logoUrl, setLogoUrl] = useState(() => readStoredIdentity().logoUrl);
  const [businessType, setBusinessType] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const { setBottomNavVisible } = useUIStore();

  useEffect(() => {
    const saved = localStorage.getItem("pos:resuming_order");
    if (saved) {
      const order = JSON.parse(saved);
      setActiveOrderId(order.id);
      const resumedCart = order.items.map((item: any) => ({
        id: item.catalog_item_id,
        name: item.name,
        base_price: Number(item.unit_price),
        qty: Number(item.qty),
      }));
      setCart(resumedCart);
      setServiceType(order.service_type || "dine_in");
      setSelectedTable(order.table_id?.toString() || null);
      localStorage.removeItem("pos:resuming_order");
    }

    const handleResume = (e: any) => {
      const order = e.detail;
      setActiveOrderId(order.id);
      const resumedCart = order.items.map((item: any) => ({
        id: item.catalog_item_id,
        name: item.name,
        base_price: Number(item.unit_price),
        qty: Number(item.qty),
      }));
      setCart(resumedCart);
      setServiceType(order.service_type || "dine_in");
      setSelectedTable(order.table_id?.toString() || null);
      setShowCheckout(false);
      setShowCartDrawer(false);
    };
    window.addEventListener("pos:resume_order", handleResume);
    return () => window.removeEventListener("pos:resume_order", handleResume);
  }, []);

  useEffect(() => {
    if (showCartDrawer || showCheckout || lastSale) {
      setBottomNavVisible(false);
    } else {
      setBottomNavVisible(true);
    }
  }, [showCartDrawer, showCheckout, lastSale, setBottomNavVisible]);

  useEffect(() => {
    async function load() {
      // 1. Try loading from Cache first (Instant)
      const cachedItems = localStorage.getItem("pos:items");
      const cachedCats = localStorage.getItem("pos:categories");

      if (cachedItems) setItems(JSON.parse(cachedItems));
      if (cachedCats) setCategories(JSON.parse(cachedCats));

      // If we have cache, we can hide initial loader immediately
      if (cachedItems && cachedCats) {
        setLoading(false);
      }

      try {
        if (!cachedItems) setLoading(true);

        const token = await getToken();
        const [resItems, resCats, resMe, resOrders] = await Promise.all([
          apiFetch<any>("/catalog/items", { token }),
          apiFetch<any>("/catalog/categories", { token }),
          apiFetch<any>("/me", { token }),
          apiFetch<any>("/orders", { token }),
        ]);

        if (resMe?.merchant) {
          const m = resMe.merchant;
          setStoreName(m.name);
          setLogoUrl(m.profile?.logo_url || "");
          setBusinessType(m.business_type || "");
          writeStoredIdentity({
            storeName: m.name,
            logoUrl: m.profile?.logo_url || "",
            status: m.status,
            ownerEmail: m.profile?.email,
          });
        }

        const newItems = Array.isArray(resItems.data)
          ? resItems.data
          : Array.isArray(resItems)
            ? resItems
            : [];
        const newCats = Array.isArray(resCats.data)
          ? resCats.data
          : Array.isArray(resCats)
            ? resCats
            : [];
        const newOrders = Array.isArray(resOrders.data)
          ? resOrders.data
          : Array.isArray(resOrders)
            ? resOrders
            : Array.isArray(resOrders.data?.data)
              ? resOrders.data.data
              : [];

        setItems(newItems);
        setCategories(newCats);
        setOrders(newOrders);

        // 2. Save to Cache for next time
        localStorage.setItem("pos:items", JSON.stringify(newItems));
        localStorage.setItem("pos:categories", JSON.stringify(newCats));
        localStorage.setItem("pos:orders", JSON.stringify(newOrders));

        setNoMerchant(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("403") || message.includes("Merchant"))
          setNoMerchant(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex)
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === id);
      if (ex && ex.qty > 1)
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
      return prev.filter((i) => i.id !== id);
    });
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.base_price) * Number(item.qty),
    0,
  );
  const itemCount = cart.reduce((acc, item) => acc + Number(item.qty), 0);
  const paidValue = Number(paidAmount) || 0;
  const changeAmount = Math.max(paidValue - subtotal, 0);
  const isRestaurantMerchant = businessType === "restaurant_cafe";
  const activeService =
    serviceTypes.find((type) => type.id === serviceType) ?? serviceTypes[1];
  const selectedServiceLabel = isRestaurantMerchant
    ? activeService.label
    : "Kasir";
  const selectedServiceShortLabel = isRestaurantMerchant
    ? activeService.shortLabel
    : "Kasir";
  const selectedPayment =
    paymentMethods.find((method) => method.id === paymentMethod) ??
    paymentMethods[0];
  const paymentShortcuts = useMemo(
    () => buildPaymentShortcuts(subtotal),
    [subtotal],
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) &&
          (selectedCategory
            ? (i as CatalogItem & { category_id?: number }).category_id ===
              selectedCategory
            : true),
      ),
    [items, query, selectedCategory],
  );

  const openCheckout = () => {
    setShowCartDrawer(false);
    setShowCheckout(true);
    setPaidAmount(subtotal.toString());
  };

  useEffect(() => {
    if (!businessType) return;
    if (isRestaurantMerchant && serviceType === "counter") {
      setServiceType("dine_in");
    }
    if (!isRestaurantMerchant && serviceType !== "counter") {
      setServiceType("counter");
    }
  }, [businessType, isRestaurantMerchant, serviceType]);

  const handleSaveOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const endpoint = activeOrderId
        ? `/orders/${activeOrderId}/sync-items`
        : "/orders";
      await apiFetch<any>(endpoint, {
        method: "POST",
        token,
        body: JSON.stringify({
          source: "cashier",
          service_type: isRestaurantMerchant ? serviceType : "counter",
          table_id: selectedTable,
          items: cart.map((i) => ({
            catalog_item_id: i.id,
            qty: i.qty,
            unit_price: i.base_price,
          })),
        }),
      });
      setCart([]);
      setActiveOrderId(null);
      setShowCartDrawer(false);
    } catch (e) {
      console.error("Failed to save order:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const currentItems = cart.map((item) => ({ ...item }));
    const currentSubtotal = subtotal;
    const currentPaid = Number(paidAmount) || currentSubtotal;
    const currentOrderId = activeOrderId;
    const invoiceNumber = `POS-${Date.now()}`;

    // --- OPTIMISTIC UI ---
    setReceiptSnapshot({
      invoiceNumber,
      soldAt: new Date().toISOString(),
      storeName,
      serviceLabel: selectedServiceLabel,
      paymentLabel: selectedPayment.label,
      items: currentItems,
      subtotal: currentSubtotal,
      paidAmount: currentPaid,
      changeAmount: Math.max(currentPaid - currentSubtotal, 0),
      table_id: selectedTable,
    });

    setLastSale({ id: "pending", invoice_number: invoiceNumber });
    setCart([]);
    setActiveOrderId(null);
    setShowCheckout(false);
    setShowCartDrawer(false);
    setPaidAmount("");
    setReceiptChannel("print");

    // --- BACKGROUND PROCESS ---
    const processInBackground = async () => {
      try {
        const token = await getToken();
        let orderId = currentOrderId;

        if (orderId) {
          // Sync items first if it's an existing order
          await apiFetch<any>(`/orders/${orderId}/sync-items`, {
            method: "POST",
            token,
            body: JSON.stringify({
              items: currentItems.map((i) => ({
                catalog_item_id: i.id,
                qty: i.qty,
                unit_price: i.base_price,
              })),
            }),
          });
        } else {
          // Create new order
          const orderRes = await apiFetch<any>("/orders", {
            method: "POST",
            token,
            body: JSON.stringify({
              source: "cashier",
              service_type: isRestaurantMerchant ? serviceType : "counter",
              table_id: selectedTable,
              items: currentItems.map((i) => ({
                catalog_item_id: i.id,
                qty: i.qty,
                unit_price: i.base_price,
              })),
            }),
          });
          orderId = orderRes.id;
        }

        // 2. Checkout
        const saleRes = await apiFetch<any>(
          "/orders/" + orderId + "/checkout",
          {
            method: "POST",
            token,
            body: JSON.stringify({
              payment_method: paymentMethod,
              paid_amount: currentPaid,
            }),
          },
        );

        console.log("Background checkout success:", saleRes.invoice_number);

        // Update receipt snapshot with real invoice number from server
        setReceiptSnapshot((prev) =>
          prev
            ? {
                ...prev,
                invoiceNumber: saleRes.invoice_number || prev.invoiceNumber,
              }
            : null,
        );
      } catch (e) {
        console.error("Background checkout failed, saving to queue:", e);
        // Simpan ke antrean offline jika gagal
        const queue = JSON.parse(
          localStorage.getItem("pos:sync_queue") || "[]",
        );
        queue.push({
          id: invoiceNumber,
          data: {
            items: currentItems,
            payment_method: paymentMethod,
            paid_amount: currentPaid,
            service_type: isRestaurantMerchant ? serviceType : "counter",
          },
          timestamp: Date.now(),
        });
        localStorage.setItem("pos:sync_queue", JSON.stringify(queue));
      }
    };

    processInBackground();
  };

  const printReceipt = () => {
    window.print();
  };

  const buildReceiptMessage = (receipt: ReceiptSnapshot) => {
    const lines = [
      receipt.storeName,
      receipt.invoiceNumber,
      new Date(receipt.soldAt).toLocaleString("id-ID"),
      receipt.serviceLabel +
        (receipt.table_id ? ` (Meja ${receipt.table_id})` : ""),
      "",
      ...receipt.items.flatMap((item) => [
        item.name,
        `${Number(item.qty)} x ${money.format(item.base_price)} = ${money.format(
          item.base_price * item.qty,
        )}`,
      ]),
      "",
      `Total: ${money.format(receipt.subtotal)}`,
      `${receipt.paymentLabel}: ${money.format(receipt.paidAmount)}`,
      `Kembali: ${money.format(receipt.changeAmount)}`,
      "",
      "Terima kasih",
    ];

    return lines.join("\n");
  };

  const normalizedWhatsapp = receiptWhatsapp
    .replace(/\D/g, "")
    .replace(/^0/, "62");

  const sendReceiptWhatsapp = () => {
    if (!receiptSnapshot || !normalizedWhatsapp) return;
    const message = encodeURIComponent(buildReceiptMessage(receiptSnapshot));
    window.open(
      `https://wa.me/${normalizedWhatsapp}?text=${message}`,
      "_blank",
    );
  };

  const sendReceiptEmail = () => {
    if (!receiptSnapshot || !receiptEmail.trim()) return;
    const subject = encodeURIComponent(
      `Struk ${receiptSnapshot.invoiceNumber} - ${receiptSnapshot.storeName}`,
    );
    const body = encodeURIComponent(buildReceiptMessage(receiptSnapshot));
    window.location.href = `mailto:${receiptEmail.trim()}?subject=${subject}&body=${body}`;
  };

  if (noMerchant)
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Toko Belum Siap</h2>
      </div>
    );
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-sage-600" />
      </div>
    );

  return (
    <>
      <div className="screen-only min-h-screen bg-[#F9FAFB] flex flex-col pb-72">
        <div className="bg-white sticky top-0 z-30 shadow-sm">
          <header className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sage-50 rounded-xl flex items-center justify-center text-base border border-line/50 overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  "🌿"
                )}
              </div>
              <h1 className="text-xs font-black text-sage-900 truncate max-w-[120px]">
                {storeName}
              </h1>
            </div>

            <UserButton afterSignOutUrl="/sign-in" />
          </header>

          <div className="px-4 pb-4 flex gap-3 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400 group-focus-within:text-sage-600 transition-colors" />
                <input
                  placeholder="Cari menu..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 bg-sage-50 border-none rounded-xl pl-9 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-sage-200 transition-all"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={
                    "whitespace-nowrap px-4 h-8 rounded-lg text-[10px] font-black transition-all " +
                    (selectedCategory === null
                      ? "bg-sage-800 text-white shadow-md"
                      : "bg-sage-50 text-sage-500 hover:bg-sage-100")
                  }
                >
                  SEMUA
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={
                      "whitespace-nowrap px-4 h-8 rounded-lg text-[10px] font-black transition-all " +
                      (selectedCategory === cat.id
                        ? "bg-sage-800 text-white shadow-md"
                        : "bg-sage-50 text-sage-500 hover:bg-sage-100")
                    }
                  >
                    {cat.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center shrink-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  title="Scan barcode"
                  className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600 active:scale-90 transition-transform hover:bg-sage-100 border border-line/30"
                >
                  <Scan className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  title="Ambil foto"
                  className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600 active:scale-90 transition-transform hover:bg-sage-100 border border-line/30"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {isRestaurantMerchant && (
                <div className="flex bg-sage-50 p-1 rounded-lg gap-1 w-[88px] h-8 justify-between border border-line/30">
                  {serviceTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      title={type.label}
                      onClick={() => {
                        setServiceType(type.id);
                        if (type.id === "dine_in") {
                          setShowTableModal(true);
                        } else {
                          setSelectedTable(null);
                        }
                      }}
                      className={
                        "p-0.5 rounded-md transition-all flex-1 flex items-center justify-center " +
                        (serviceType === type.id
                          ? "bg-white shadow-sm text-sage-900"
                          : "text-sage-400 hover:text-sage-600")
                      }
                    >
                      <type.icon
                        className={
                          "w-3 h-3 " +
                          (serviceType === type.id ? type.color : "")
                        }
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                qty={cart.find((c) => c.id === item.id)?.qty || 0}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-[108px] left-3 right-3 z-40 sm:left-1/2 sm:right-auto sm:w-[480px] sm:-translate-x-1/2">
            <div className="bg-sage-900 text-white rounded-2xl shadow-2xl shadow-sage-900/25 border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCartDrawer(true)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-white text-sage-900 text-[10px] font-black flex items-center justify-center">
                      {itemCount}
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sage-200 font-black">
                      Keranjang aktif
                    </p>
                    <p className="text-sm font-black truncate">
                      {itemCount} item - {selectedServiceShortLabel}
                      {serviceType === "dine_in" &&
                        selectedTable &&
                        ` (Meja ${selectedTable})`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black leading-tight">
                    {money.format(subtotal)}
                  </p>
                  <p className="text-[10px] text-sage-200 font-bold">
                    Ketuk untuk detail
                  </p>
                </div>
              </button>
              <div className="px-4 pb-4 flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSaveOrder}
                  className="flex-1 h-12 rounded-xl bg-white/10 text-white border border-white/20 font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      <ReceiptText className="w-4 h-4" />
                      OPEN
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={openCheckout}
                  className="flex-[2] h-12 rounded-xl bg-white text-sage-900 font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  CLOSE (BAYAR)
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showCartDrawer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={() => setShowCartDrawer(false)}
            />
            <div className="relative bg-[#F9FAFB] w-full max-w-xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[88vh] flex flex-col">
              <div className="px-5 pt-4 pb-3 bg-white rounded-t-3xl border-b border-line/70">
                <div className="w-12 h-1.5 bg-sage-100 rounded-full mx-auto mb-4" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-black text-sage-400">
                      Order berjalan
                    </p>
                    <h3 className="font-black text-xl text-sage-900">
                      Keranjang
                    </h3>
                  </div>
                  <button
                    type="button"
                    title="Tutup"
                    onClick={() => setShowCartDrawer(false)}
                    className="w-10 h-10 flex items-center justify-center bg-sage-50 rounded-xl hover:bg-sage-100 transition-all"
                  >
                    <X className="w-5 h-5 text-sage-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-line/70 p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center text-base font-black text-sage-500 border border-line/50">
                        {item.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-sm text-sage-900 leading-tight line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-sage-500 font-bold mt-0.5">
                          {money.format(item.base_price)} / item
                        </p>
                      </div>
                      <p className="font-black text-sm text-sage-900">
                        {money.format(item.base_price * item.qty)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setCart((prev) =>
                            prev.filter((i) => i.id !== item.id),
                          );
                        }}
                        className="h-9 px-3 rounded-xl bg-red-50 text-red-600 flex items-center gap-2 text-xs font-black"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                      <div className="flex items-center gap-2 bg-sage-50 border border-line/70 p-1 rounded-xl">
                        <button
                          type="button"
                          title="Kurangi"
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sage-700 shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-black text-sm text-sage-900 w-8 text-center">
                          {Number(item.qty)}
                        </span>
                        <button
                          type="button"
                          title="Tambah"
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-lg bg-sage-800 text-white flex items-center justify-center shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border-t border-line/70 p-4 pb-8">
                <div className="rounded-2xl bg-sage-50 border border-line/70 p-4 space-y-3 mb-4">
                  <div className="flex justify-between text-sm font-bold text-sage-500">
                    <span>Jumlah item</span>
                    <span>{itemCount}</span>
                  </div>
                  {isRestaurantMerchant && (
                    <div className="flex justify-between text-sm font-bold text-sage-500">
                      <span>Layanan</span>
                      <span>{selectedServiceLabel}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-line/70">
                    <span className="text-xs uppercase tracking-[0.18em] font-black text-sage-500">
                      Total
                    </span>
                    <span className="text-2xl font-black text-sage-900">
                      {money.format(subtotal)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSaveOrder}
                    className="flex-1 bg-sage-50 text-sage-600 h-14 rounded-xl font-black text-sm flex items-center justify-center gap-2 border border-line/70 active:scale-95 transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        <ReceiptText className="w-5 h-5" />
                        OPEN (SIMPAN)
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={openCheckout}
                    className="flex-[1.5] bg-sage-800 text-white h-14 rounded-xl font-black shadow-xl shadow-sage-800/25 text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    CLOSE (BAYAR)
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCheckout && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md sm:p-6">
            <div className="bg-[#F9FAFB] w-full max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
              <div className="bg-white px-5 py-4 border-b border-line/70 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] font-black text-sage-400">
                    Checkout
                  </p>
                  <h3 className="text-xl font-black text-sage-900">
                    Pembayaran
                  </h3>
                </div>
                <button
                  type="button"
                  title="Tutup"
                  onClick={() => setShowCheckout(false)}
                  className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-sage-700" />
                </button>
              </div>

              <div className="grid md:grid-cols-[1fr_320px] gap-4 p-4 max-h-[82vh] overflow-y-auto no-scrollbar">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-line/70 p-4">
                    <p className="text-xs font-black text-sage-500 uppercase tracking-[0.14em] mb-3">
                      Metode Bayar
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={
                            "h-20 rounded-xl border flex flex-col items-center justify-center gap-2 font-black text-xs transition-all " +
                            (paymentMethod === method.id
                              ? "bg-sage-800 text-white border-sage-800 shadow-lg shadow-sage-800/20"
                              : "bg-sage-50 text-sage-600 border-line/70")
                          }
                        >
                          <method.icon className="w-5 h-5" />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-line/70 p-4">
                    <label
                      htmlFor="paid-amount"
                      className="text-xs font-black text-sage-500 uppercase tracking-[0.14em]"
                    >
                      Nominal Diterima
                    </label>
                    <input
                      id="paid-amount"
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="mt-3 w-full border-2 border-line/70 focus:border-sage-500 focus:ring-4 focus:ring-sage-100 outline-none h-16 rounded-xl px-4 font-black text-2xl text-right transition-all bg-sage-50/40"
                    />
                    <div className="mt-3">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.14em] font-black text-sage-400">
                        Shortcut Pecahan
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {paymentShortcuts.map((amount) => {
                          const isSelected = paidValue === amount;

                          return (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => setPaidAmount(amount.toString())}
                              className={
                                "h-10 rounded-xl border text-[11px] font-black transition-all " +
                                (isSelected
                                  ? "bg-sage-800 text-white border-sage-800 shadow-lg shadow-sage-800/20"
                                  : "bg-sage-50 text-sage-700 border-line/70")
                              }
                            >
                              {money.format(amount)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-line/70 p-4 h-fit">
                  <div className="flex items-center gap-2 mb-4">
                    <ReceiptText className="w-5 h-5 text-sage-700" />
                    <p className="font-black text-sage-900">Ringkasan Struk</p>
                  </div>
                  <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-black text-sage-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-sage-400">
                            {Number(item.qty)} x {money.format(item.base_price)}
                          </p>
                        </div>
                        <p className="font-black text-sage-900">
                          {money.format(item.base_price * item.qty)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed border-line space-y-2">
                    <div className="flex justify-between text-sm font-bold text-sage-500">
                      <span>Total</span>
                      <span>{money.format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-sage-500">
                      <span>Dibayar</span>
                      <span>{money.format(paidValue)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs uppercase tracking-[0.16em] font-black text-sage-500">
                        Kembali
                      </span>
                      <span className="text-xl font-black text-sage-900">
                        {money.format(changeAmount)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={submitting || paidValue < subtotal}
                    onClick={handleCheckout}
                    className="mt-5 w-full bg-sage-800 text-white h-14 rounded-xl font-black shadow-xl shadow-sage-800/25 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        Konfirmasi Bayar
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {lastSale && receiptSnapshot && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-xl">
            <div className="bg-[#F9FAFB] rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
              <div className="bg-white p-5 text-center border-b border-line/70">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <CheckCircle2 className="w-9 h-9 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-sage-900 tracking-tight">
                  Transaksi Berhasil
                </h3>
                <p className="text-sage-500 text-xs font-bold mt-1">
                  {receiptSnapshot.invoiceNumber}
                </p>
              </div>

              <div className="p-4 max-h-[78vh] overflow-y-auto no-scrollbar">
                <div className="bg-white rounded-2xl border border-line/70 p-4 font-mono text-sm">
                  <div className="text-center border-b border-dashed border-line pb-3 mb-3">
                    <p className="font-black text-sage-900 font-sans">
                      {storeName}
                    </p>
                    <p className="text-[11px] text-sage-500">
                      {new Date(receiptSnapshot.soldAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {receiptSnapshot.items.map((item) => (
                      <div key={item.id}>
                        <div className="flex justify-between gap-3">
                          <span className="truncate">{item.name}</span>
                          <span>
                            {money.format(item.base_price * item.qty)}
                          </span>
                        </div>
                        <p className="text-xs text-sage-500">
                          {Number(item.qty)} x {money.format(item.base_price)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-line mt-3 pt-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>{money.format(receiptSnapshot.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bayar</span>
                      <span>{money.format(receiptSnapshot.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between font-black">
                      <span>Kembali</span>
                      <span>{money.format(receiptSnapshot.changeAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white rounded-2xl border border-line/70 p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReceiptChannel("print")}
                      className={
                        "h-16 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-black " +
                        (receiptChannel === "print"
                          ? "bg-sage-800 text-white border-sage-800"
                          : "bg-sage-50 text-sage-600 border-line/70")
                      }
                    >
                      <Printer className="w-5 h-5" />
                      Kertas
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptChannel("whatsapp")}
                      className={
                        "h-16 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-black " +
                        (receiptChannel === "whatsapp"
                          ? "bg-sage-800 text-white border-sage-800"
                          : "bg-sage-50 text-sage-600 border-line/70")
                      }
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptChannel("email")}
                      className={
                        "h-16 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-black " +
                        (receiptChannel === "email"
                          ? "bg-sage-800 text-white border-sage-800"
                          : "bg-sage-50 text-sage-600 border-line/70")
                      }
                    >
                      <Mail className="w-5 h-5" />
                      Email
                    </button>
                  </div>

                  {receiptChannel === "whatsapp" && (
                    <label className="block mt-3">
                      <span className="text-[10px] uppercase tracking-[0.14em] font-black text-sage-500">
                        Nomor WhatsApp
                      </span>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={receiptWhatsapp}
                        onChange={(e) => setReceiptWhatsapp(e.target.value)}
                        placeholder="081234567890"
                        className="mt-2 w-full h-12 rounded-xl border border-line/70 bg-sage-50/60 px-4 text-sm font-black text-sage-900 outline-none focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                      />
                    </label>
                  )}

                  {receiptChannel === "email" && (
                    <label className="block mt-3">
                      <span className="text-[10px] uppercase tracking-[0.14em] font-black text-sage-500">
                        Email Tujuan
                      </span>
                      <input
                        type="email"
                        inputMode="email"
                        value={receiptEmail}
                        onChange={(e) => setReceiptEmail(e.target.value)}
                        placeholder="pelanggan@email.com"
                        className="mt-2 w-full h-12 rounded-xl border border-line/70 bg-sage-50/60 px-4 text-sm font-black text-sage-900 outline-none focus:border-sage-500 focus:ring-4 focus:ring-sage-100"
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={
                      receiptChannel === "print"
                        ? printReceipt
                        : receiptChannel === "whatsapp"
                          ? sendReceiptWhatsapp
                          : sendReceiptEmail
                    }
                    disabled={
                      (receiptChannel === "whatsapp" && !normalizedWhatsapp) ||
                      (receiptChannel === "email" && !receiptEmail.trim())
                    }
                    className="h-12 rounded-xl bg-sage-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-sage-800/25"
                  >
                    {receiptChannel === "print" ? (
                      <Printer className="w-4 h-4" />
                    ) : receiptChannel === "whatsapp" ? (
                      <MessageCircle className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {receiptChannel === "print"
                      ? "Cetak Struk"
                      : receiptChannel === "whatsapp"
                        ? "Kirim WA"
                        : "Kirim Email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLastSale(null)}
                    className="h-12 rounded-xl bg-white border border-line/70 font-black text-sm text-sage-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {receiptSnapshot && (
        <div className="print-only thermal-receipt p-4 font-mono text-[11px] text-black">
          <div className="text-center">
            <div className="text-base font-black">
              {receiptSnapshot.storeName}
            </div>
            <div>{receiptSnapshot.invoiceNumber}</div>
            <div>
              {new Date(receiptSnapshot.soldAt).toLocaleString("id-ID")}
            </div>
            <div>
              {receiptSnapshot.serviceLabel}
              {receiptSnapshot.table_id &&
                ` (Meja ${receiptSnapshot.table_id})`}
            </div>
          </div>
          <div className="border-t border-dashed border-black my-3" />
          {receiptSnapshot.items.map((item) => (
            <div key={item.id} className="mb-2">
              <div>{item.name}</div>
              <div className="flex justify-between">
                <span>
                  {Number(item.qty)} x {money.format(item.base_price)}
                </span>
                <span>{money.format(item.base_price * item.qty)}</span>
              </div>
            </div>
          ))}
          <div className="border-t border-dashed border-black my-3" />
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{money.format(receiptSnapshot.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{receiptSnapshot.paymentLabel}</span>
              <span>{money.format(receiptSnapshot.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-black">
              <span>Kembali</span>
              <span>{money.format(receiptSnapshot.changeAmount)}</span>
            </div>
          </div>
          <div className="border-t border-dashed border-black my-3" />
          <div className="text-center">Terima kasih</div>
        </div>
      )}

      {showTableModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div
            className="absolute inset-0"
            onClick={() => setShowTableModal(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] px-6 pt-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-sage-100 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-sage-900 uppercase tracking-tight">
                  Pilih Nomor Meja
                </h3>
                <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mt-1">
                  Layanan: Makan di Sini
                </p>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-2 bg-sage-50 rounded-full text-sage-400 hover:text-sage-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(
                (table) => {
                  const activeOrder = orders.find(
                    (o) =>
                      String(o.table_id) === table &&
                      (o.order_status === "draft" ||
                        o.order_status === "pending"),
                  );

                  return (
                    <button
                      key={table}
                      type="button"
                      onClick={() => {
                        if (activeOrder) {
                          const resumedCart = activeOrder.items.map(
                            (item: any) => ({
                              id: item.catalog_item_id,
                              name: item.name,
                              base_price: Number(item.unit_price),
                              qty: Number(item.qty),
                            }),
                          );
                          setCart(resumedCart);
                          setActiveOrderId(activeOrder.id);
                          setServiceType("dine_in");
                          setSelectedTable(table);
                        } else {
                          setSelectedTable(table);
                        }
                        setShowTableModal(false);
                      }}
                      className={
                        "relative h-20 rounded-xl font-black text-lg transition-all flex flex-col items-center justify-center border-2 " +
                        (selectedTable === table
                          ? "bg-sage-800 text-white border-sage-800 shadow-lg shadow-sage-800/20"
                          : activeOrder
                            ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
                            : "bg-sage-50 text-sage-400 border-transparent hover:border-sage-200")
                      }
                    >
                      <div
                        className={
                          "absolute top-1 w-8 h-1 rounded-full " +
                          (selectedTable === table
                            ? "bg-white/40"
                            : activeOrder
                              ? "bg-amber-200"
                              : "bg-sage-200")
                        }
                      />

                      <span className="mt-1">{table}</span>

                      {activeOrder && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-300">
                          <ShoppingCart className="w-3 h-3" />
                        </div>
                      )}

                      <div className="flex gap-4 mt-1">
                        <div
                          className={
                            "w-1 h-2 rounded-full " +
                            (selectedTable === table
                              ? "bg-white/20"
                              : activeOrder
                                ? "bg-amber-100"
                                : "bg-sage-100")
                          }
                        />
                        <div
                          className={
                            "w-1 h-2 rounded-full " +
                            (selectedTable === table
                              ? "bg-white/20"
                              : activeOrder
                                ? "bg-amber-100"
                                : "bg-sage-100")
                          }
                        />
                      </div>
                    </button>
                  );
                },
              )}
            </div>

            <button
              onClick={() => {
                setSelectedTable(null);
                setShowTableModal(false);
              }}
              className="w-full mt-8 h-12 rounded-xl bg-sage-50 text-sage-500 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              Tanpa Nomor Meja
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function PosRegister() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-sage-600" />
      </div>
    );
  return <PosContent />;
}
