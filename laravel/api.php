<?php

use App\Http\Controllers\Api\Auth\ClerkWebhookController;
use App\Http\Controllers\Api\AdminMerchantController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MerchantOnboardingController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\StoreController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| POS API Routes
|--------------------------------------------------------------------------
|
| Simpan isi file ini ke routes/api.php pada project Laravel.
| Frontend Next.js mengirim Clerk JWT di header:
| Authorization: Bearer <token>
|
| Buat middleware "auth.clerk" untuk validasi JWT Clerk, lalu sinkronkan
| clerk_user_id ke user lokal Laravel.
|
*/

Route::post("/webhooks/clerk", ClerkWebhookController::class)->name(
    "webhooks.clerk",
);

Route::middleware(["auth.clerk"])->group(function () {
    Route::get("/me", [DashboardController::class, "me"]);

    // Onboarding - Store new merchant registration
    Route::post("/merchants", [
        MerchantOnboardingController::class,
        "store",
    ])->name("merchants.store");

    // Admin - List and verify merchants
    Route::get("/admin/merchants", [
        AdminMerchantController::class,
        "index",
    ])->name("admin.merchants.index");
    Route::patch("/admin/merchants/{merchant}/verify", [
        AdminMerchantController::class,
        "verify",
    ])->name("admin.merchants.verify");

    Route::get("/dashboard/summary", [DashboardController::class, "summary"]);
    Route::get("/dashboard/top-products", [
        DashboardController::class,
        "topProducts",
    ]);

    Route::apiResource("stores", StoreController::class);
    Route::apiResource("categories", CategoryController::class);
    Route::apiResource("products", ProductController::class);
    Route::apiResource("customers", CustomerController::class);

    Route::get("/stock-movements", [StockMovementController::class, "index"]);
    Route::post("/stock-movements/adjust", [
        StockMovementController::class,
        "adjust",
    ]);

    Route::get("/sales", [SaleController::class, "index"]);
    Route::post("/sales", [SaleController::class, "store"]);
    Route::get("/sales/{sale}", [SaleController::class, "show"]);
    Route::post("/sales/{sale}/refund", [SaleController::class, "refund"]);
    Route::get("/sales/{sale}/receipt", [SaleController::class, "receipt"]);

    Route::prefix("reports")->group(function () {
        Route::get("/sales", [ReportController::class, "sales"]);
        Route::get("/inventory", [ReportController::class, "inventory"]);
        Route::get("/cashier", [ReportController::class, "cashier"]);
    });
});
