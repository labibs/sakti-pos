import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "pk_test_cGxhY2Vob2xkZXIuY2xlcmsuYWNjb3VudHMuZGV2JA";

export const metadata: Metadata = {
  title: "Sakti POS",
  description: "POS PWA Next.js",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <ClerkProvider publishableKey={publishableKey}>
          {children}
        </ClerkProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
