<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MerchantUser;
use App\Models\Order;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

abstract class PosApiController extends Controller
{
    protected function merchantId(Request $request): int
    {
        if ($request->header("X-Merchant-Id")) {
            return (int) $request->header("X-Merchant-Id");
        }

        $user = $request->user();

        if ($user && isset($user->merchant_id)) {
            return (int) $user->merchant_id;
        }

        if ($user) {
            $merchantUser = MerchantUser::where("user_id", $user->id)
                ->where("is_active", true)
                ->first();

            if ($merchantUser) {
                return (int) $merchantUser->merchant_id;
            }
        }

        abort(403, "Merchant tidak ditemukan untuk user ini.");
    }

    protected function userId(Request $request): ?int
    {
        return $request->user()?->id;
    }

    protected function nextOrderNumber(int $merchantId): string
    {
        return "ORD-" . now()->format("ymd") . "-" . Str::upper(Str::random(6));
    }

    protected function nextInvoiceNumber(int $merchantId): string
    {
        return "INV-" . now()->format("ymd") . "-" . Str::upper(Str::random(6));
    }

    protected function recalculateOrder(Order $order): Order
    {
        $subtotal = $order->items()->sum("total");
        $discount = (float) $order->discount_amount;
        $tax = (float) $order->tax_amount;
        $service = (float) $order->service_charge_amount;
        $shipping = (float) $order->shipping_amount;

        $order->update([
            "subtotal" => $subtotal,
            "total" => max(
                $subtotal - $discount + $tax + $service + $shipping,
                0,
            ),
        ]);

        return $order->fresh(["items", "customer"]);
    }

    protected function buildReceiptText(Sale $sale): string
    {
        $sale->loadMissing(["items", "payments", "order.customer"]);
        $lines = [
            "Sakti",
            "Invoice: " . $sale->invoice_number,
            "Tanggal: " . $sale->sold_at?->format("d/m/Y H:i"),
            "",
        ];

        foreach ($sale->items as $item) {
            $lines[] = $item->name;
            $lines[] =
                $item->qty .
                " x " .
                number_format((float) $item->unit_price, 0, ",", ".") .
                " = " .
                number_format((float) $item->total, 0, ",", ".");
        }

        $lines[] = "";
        $lines[] =
            "Subtotal: Rp " .
            number_format((float) $sale->subtotal, 0, ",", ".");
        $lines[] =
            "Diskon: Rp " .
            number_format((float) $sale->discount_amount, 0, ",", ".");
        $lines[] =
            "Pajak: Rp " .
            number_format((float) $sale->tax_amount, 0, ",", ".");
        $lines[] =
            "Total: Rp " . number_format((float) $sale->total, 0, ",", ".");
        $lines[] =
            "Bayar: Rp " .
            number_format((float) $sale->paid_amount, 0, ",", ".");
        $lines[] =
            "Kembali: Rp " .
            number_format((float) $sale->change_amount, 0, ",", ".");
        $lines[] = "";
        $lines[] = "Terima kasih.";

        return implode("\n", $lines);
    }
}
