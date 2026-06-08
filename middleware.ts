import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/delivery(.*)",
  "/kitchen(.*)",
  "/onboarding(.*)",
  "/pos(.*)",
  "/setting(.*)",
  "/scan(.*)",
  "/products(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/register(.*)",
  "/customer(.*)",
  "/guest(.*)",
  "/landing(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  // Ambil role dari session claims
  // Secara default Clerk menaruh metadata di bawah 'publicMetadata' atau 'metadata'
  const role =
    (sessionClaims?.publicMetadata as any)?.role ||
    (sessionClaims?.metadata as any)?.role;

  // 1. Lindungi rute Admin
  if (isAdminRoute(request)) {
    if (!userId) {
      return (await auth()).redirectToSignIn();
    }

    // DEBUG: Jika Anda masih gagal, coba buka dashboard dashboard dan lihat log server jika ada
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 2. Lindungi rute Member umum
  if (isProtectedRoute(request) && !isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
