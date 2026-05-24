"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Scan, Users, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/pos", label: "POS", icon: Receipt },
  { href: "/scan", label: "Scan", icon: Scan, isMain: true },
  { href: "/products", label: "Produk", icon: Users },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-line px-6 pb-6 pt-3 flex justify-between items-center sm:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.isMain) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center -mt-12 bg-sage-700 text-white w-14 h-14 rounded-full shadow-lg shadow-sage-700/40 active:scale-90 transition-transform"
            >
              <item.icon className="w-6 h-6" />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "flex flex-col items-center gap-1 transition-colors " +
              (isActive ? "text-sage-700" : "text-sage-400")
            }
          >
            <item.icon className={"w-6 h-6 " + (isActive ? "fill-current" : "")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
