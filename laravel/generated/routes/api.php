<?php

use App\Http\Controllers\Api\CatalogCategoryController;
use App\Http\Controllers\Api\CatalogItemController;
use App\Http\Controllers\Api\AdminMerchantController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\MerchantController;
use App\Http\Controllers\Api\MerchantModuleController;
use App\Http\Controllers\Api\MerchantOnboardingController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SaleController;
use Illuminate\Support\Facades\Route;

// Rute Publik untuk Testing
Route::get("/ping", function () {
    return response()->json(["message" => "pong"]);
});

Route::middleware(["auth.clerk"])->group(function () {
    Route::get("/me", MeController::class);

    // Onboarding - Store new merchant registration
    Route::post("/merchants", [
        MerchantOnboardingController::class,
        "store",
    ])->name("merchants.store");

    // Merchant Management (current user's merchant)
    Route::get("/merchants", [MerchantController::class, "index"])->name(
        "merchants.index",
    );
    Route::get("/merchants/{merchant}", [
        MerchantController::class,
        "show",
    ])->name("merchants.show");
    Route::put("/merchants/{merchant}", [
        MerchantController::class,
        "update",
    ])->name("merchants.update");
    Route::delete("/merchants/{merchant}", [
        MerchantController::class,
        "destroy",
    ])->name("merchants.destroy");

    // Admin - List and verify merchants
    Route::get("/admin/merchants", [
        AdminMerchantController::class,
        "index",
    ])->name("admin.merchants.index");
    Route::patch("/admin/merchants/{merchant}/verify", [
        AdminMerchantController::class,
        "verify",
    ])->name("admin.merchants.verify");

    Route::get("/merchant/current", [MerchantController::class, "current"]);
    Route::put("/merchant/current/profile", [
        MerchantController::class,
        "updateProfile",
    ]);
    Route::get("/merchant/current/settings", [
        MerchantController::class,
        "settings",
    ]);
    Route::put("/merchant/current/settings", [
        MerchantController::class,
        "updateSettings",
    ]);

    Route::get("/merchant/current/modules", [
        MerchantModuleController::class,
        "index",
    ]);
    Route::put("/merchant/current/modules", [
        MerchantModuleController::class,
        "sync",
    ]);

    Route::apiResource("/catalog/categories", CatalogCategoryController::class)
        ->parameters(["categories" => "category"])
        ->except(["show"]);

    Route::get("/catalog/items/barcode/{barcode}", [
        CatalogItemController::class,
        "barcode",
    ]);
    Route::apiResource(
        "/catalog/items",
        CatalogItemController::class,
    )->parameters(["items" => "item"]);

    Route::apiResource("/customers", CustomerController::class);

    Route::get("/orders", [OrderController::class, "index"]);
    Route::post("/orders", [OrderController::class, "store"]);
    Route::get("/orders/{order}", [OrderController::class, "show"]);
    Route::post("/orders/{order}/items", [OrderController::class, "addItem"]);
    Route::put("/orders/{order}/items/{item}", [
        OrderController::class,
        "updateItem",
    ]);
    Route::delete("/orders/{order}/items/{item}", [
        OrderController::class,
        "removeItem",
    ]);
    Route::post("/orders/{order}/close-bill", [
        OrderController::class,
        "closeBill",
    ]);
    Route::post("/orders/{order}/reopen-bill", [
        OrderController::class,
        "reopenBill",
    ]);
    Route::post("/orders/{order}/status", [
        OrderController::class,
        "updateStatus",
    ]);
    Route::post("/orders/{order}/cancel", [OrderController::class, "cancel"]);
    Route::post("/orders/{order}/checkout", [
        SaleController::class,
        "checkout",
    ]);

    Route::get("/sales", [SaleController::class, "index"]);
    Route::get("/sales/{sale}", [SaleController::class, "show"]);
    Route::post("/sales/{sale}/refund", [SaleController::class, "refund"]);
    Route::get("/sales/{sale}/receipt", [SaleController::class, "receipt"]);

    Route::get("/documents/{document}", [DocumentController::class, "show"]);
    Route::get("/documents/{document}/text", [
        DocumentController::class,
        "text",
    ]);
    Route::post("/documents/{document}/send-whatsapp", [
        DocumentController::class,
        "sendWhatsApp",
    ]);
    Route::post("/documents/{document}/send-email", [
        DocumentController::class,
        "sendEmail",
    ]);
    Route::post("/documents/{document}/print-log", [
        DocumentController::class,
        "printLog",
    ]);
});
