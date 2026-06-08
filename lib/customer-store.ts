import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CatalogItem } from "./api";

export type ServiceType = "dine_in" | "pickup" | "delivery";
export type CartItem = CatalogItem & { qty: number };

function generateGuestId(): string {
  return "guest-" + crypto.randomUUID();
}

interface CustomerState {
  cart: CartItem[];
  serviceType: ServiceType;
  merchantId: number | null;
  tableNumber: string | null;
  customerId: number | null;
  customerName: string | null;
  registeredMerchants: number[];
  guestMerchants: number[];
  guestId: string | null;
  guestPhone: string | null;
  addToCart: (item: CatalogItem) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  setServiceType: (type: ServiceType) => void;
  setMerchantId: (id: number | null) => void;
  setTableNumber: (table: string | null) => void;
  setCustomerId: (id: number | null) => void;
  setCustomerName: (name: string | null) => void;
  markRegistered: (merchantId: number) => void;
  markGuest: (merchantId: number) => void;
  ensureGuestId: () => string;
  setGuestPhone: (phone: string) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      cart: [],
      serviceType: "dine_in",
      merchantId: null,
      tableNumber: null,
      customerId: null,
      customerName: null,
      registeredMerchants: [],
      guestMerchants: [],
      guestId: null,
      guestPhone: null,
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }
          return { cart: [...state.cart, { ...item, qty: 1 }] };
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== id),
        })),
      updateQty: (id, qty) =>
        set((state) => ({
          cart:
            qty > 0
              ? state.cart.map((i) => (i.id === id ? { ...i, qty } : i))
              : state.cart.filter((i) => i.id !== id),
        })),
      clearCart: () => set({ cart: [] }),
      setServiceType: (type) => set({ serviceType: type }),
      setMerchantId: (id) => set({ merchantId: id }),
      setTableNumber: (table) => set({ tableNumber: table }),
      setCustomerId: (id) => set({ customerId: id }),
      setCustomerName: (name) => set({ customerName: name }),
      markRegistered: (merchantId) =>
        set((state) => ({
          registeredMerchants: state.registeredMerchants.includes(merchantId)
            ? state.registeredMerchants
            : [...state.registeredMerchants, merchantId],
        })),
      markGuest: (merchantId) =>
        set((state) => ({
          guestMerchants: state.guestMerchants.includes(merchantId)
            ? state.guestMerchants
            : [...state.guestMerchants, merchantId],
        })),
      ensureGuestId: () => {
        const existing = get().guestId;
        if (existing) return existing;
        const id = generateGuestId();
        set({ guestId: id });
        return id;
      },
      setGuestPhone: (phone) => set({ guestPhone: phone }),
    }),
    {
      name: "customer-storage",
    },
  ),
);
