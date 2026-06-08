"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, ScanLine, Package, Settings } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Transaksi", icon: ClipboardList },
  { href: "/pos", label: "POS", icon: ScanLine, isMain: true },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/setting", label: "Setting", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isBottomNavVisible } = useUIStore();

  if (!isBottomNavVisible) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-line px-2 pb-6 pt-2 flex justify-between items-center sm:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        if (item.isMain) {
          return (
            <div key={item.href} className="relative -mt-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-sage-50 rounded-full border-[8px] border-sage-50 flex items-center justify-center">
                <Link
                  href={item.href}
                  className="flex items-center justify-center bg-sage-700 text-white w-16 h-16 rounded-full shadow-xl shadow-sage-700/40 active:scale-90 transition-transform"
                >
                  <item.icon className="w-8 h-8" />
                </Link>
              </div>
              <div className="pt-12 flex flex-col items-center">
                <span
                  className={
                    "text-[10px] font-bold " +
                    (isActive ? "text-sage-800" : "text-sage-400")
                  }
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "flex flex-col items-center gap-1 w-16 transition-colors " +
              (isActive ? "text-sage-800" : "text-sage-400")
            }
          >
            <item.icon
              className={"w-6 h-6 " + (isActive ? "fill-sage-800/10" : "")}
            />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
