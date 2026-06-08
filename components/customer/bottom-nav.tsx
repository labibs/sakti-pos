"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  ShoppingBag,
  ClipboardList,
  User,
  ScanLine,
  UtensilsCrossed,
} from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  isMain?: boolean;
}

export function CustomerBottomNav({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { merchantId } = useCustomerStore();
  const mQuery = merchantId ? `?m=${merchantId}` : "";

  const guestItems: NavItem[] = [
    { href: "/guest", label: "Menu", icon: UtensilsCrossed },
    { href: "/guest/cart", label: "Keranjang", icon: ShoppingBag },
    { href: "/guest/orders", label: "Riwayat", icon: ClipboardList },
  ];

  const customerItems: NavItem[] = [
    { href: "/customer", label: "Menu", icon: UtensilsCrossed },
    { href: "/customer/cart", label: "Keranjang", icon: ShoppingBag },
    {
      href: "/customer/scan",
      label: "Scan",
      icon: ScanLine,
      isMain: true,
    },
    { href: "/customer/orders", label: "Riwayat", icon: ClipboardList },
    { href: "/customer/profile", label: "Profil", icon: User },
  ];

  const navItems = isGuest ? guestItems : customerItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-line/30 px-4 pb-6 pt-2 flex justify-between items-center sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const finalHref = `${item.href}${mQuery}`;

        if (item.isMain) {
          return (
            <div key={item.href} className="relative -mt-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-sage-50/50 rounded-full border-[6px] border-[#F9FAFB] flex items-center justify-center">
                <Link
                  href={finalHref}
                  className="flex items-center justify-center bg-sage-800 text-white w-16 h-16 rounded-full shadow-xl shadow-sage-800/40 active:scale-90 transition-all border-4 border-white"
                >
                  <item.icon className="w-8 h-8" />
                </Link>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={finalHref}
            className={
              "flex flex-col items-center gap-1 w-14 transition-all duration-300 " +
              (isActive
                ? "text-sage-900 scale-110"
                : "text-sage-400 hover:text-sage-600")
            }
          >
            <item.icon
              className={
                "w-5 h-5 " +
                (isActive ? "fill-sage-900/10 stroke-[2.5px]" : "stroke-2")
              }
            />
            <span
              className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-70"}`}
            >
              {item.label}
            </span>
            {isActive && (
              <div className="w-1 h-1 bg-sage-900 rounded-full mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
