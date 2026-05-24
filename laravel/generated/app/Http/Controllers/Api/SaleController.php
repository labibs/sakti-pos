<?php

namespace App\Http\Controllers\Api;

use App\Models\Document;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends PosApiController
{
    public function index(Request $request)
    {
        $query = Sale::with(['order.customer', 'payments'])
            ->where('merchant_id', $this->merchantId($request));

        if ($request->filled('from')) {
            $query->whereDate('sold_at', '>=', $request->query('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('sold_at', '<=', $request->query('to'));
        }

        return $query->latest('sold_at')->paginate((int) $request->query('per_page', 30));
    }

    public function show(Request $request, Sale $sale)
    {
        abort_unless($sale->merchant_id === $this->merchantId($request), 404);

        return $sale->load(['items', 'payments', 'order.customer']);
    }

    public function checkout(Request $request, Order $order)
    {
        abort_unless($order->merchant_id === $this->merchantId($request), 404);
        abort_if($order->payment_status === 'paid', 422, 'Order sudah dibayar.');

        $data = $request->validate([
            'payment_method' => ['required', 'in:cash,qris,transfer,card,e_wallet,cod,deposit,credit,mixed'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'reference_number' => ['nullable', 'string', 'max:120'],
            'provider' => ['nullable', 'string', 'max:80'],
        ]);

        return DB::transaction(function () use ($order, $data, $request) {
            $order = $this->recalculateOrder($order);
            abort_if($order->items->isEmpty(), 422, 'Order belum punya item.');
            abort_if((float) $data['paid_amount'] < (float) $order->total, 422, 'Nominal bayar kurang.');

            if ($order->bill_status !== 'closed') {
                $order->update(['bill_status' => 'closed', 'closed_at' => now()]);
            }

            $sale = Sale::create([
                'merchant_id' => $order->merchant_id,
                'order_id' => $order->id,
                'invoice_number' => $this->nextInvoiceNumber($order->merchant_id),
                'subtotal' => $order->subtotal,
                'discount_amount' => $order->discount_amount,
                'tax_amount' => $order->tax_amount,
                'service_charge_amount' => $order->service_charge_amount,
                'shipping_amount' => $order->shipping_amount,
                'total' => $order->total,
                'paid_amount' => $data['paid_amount'],
                'change_amount' => max((float) $data['paid_amount'] - (float) $order->total, 0),
                'status' => 'paid',
                'sold_at' => now(),
                'cashier_id' => $this->userId($request),
            ]);

            foreach ($order->items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'order_item_id' => $item->id,
                    'catalog_item_id' => $item->catalog_item_id,
                    'item_type' => $item->item_type,
                    'name' => $item->name,
                    'qty' => $item->qty,
                    'unit' => $item->unit,
                    'unit_price' => $item->unit_price,
                    'discount_amount' => $item->discount_amount,
                    'tax_amount' => $item->tax_amount,
                    'total' => $item->total,
                ]);
            }

            Payment::create([
                'merchant_id' => $order->merchant_id,
                'sale_id' => $sale->id,
                'method' => $data['payment_method'],
                'amount' => $data['paid_amount'],
                'status' => 'paid',
                'reference_number' => $data['reference_number'] ?? null,
                'provider' => $data['provider'] ?? null,
                'paid_at' => now(),
            ]);

            $order->update([
                'order_status' => 'completed',
                'payment_status' => 'paid',
                'fulfillment_status' => 'fulfilled',
                'completed_at' => now(),
            ]);

            $sale = $sale->fresh(['items', 'payments', 'order.customer']);

            Document::create([
                'merchant_id' => $sale->merchant_id,
                'order_id' => $sale->order_id,
                'sale_id' => $sale->id,
                'document_type' => 'receipt',
                'document_number' => 'RCPT-' . $sale->invoice_number,
                'format' => 'text',
                'status' => 'generated',
                'content_text' => $this->buildReceiptText($sale),
            ]);

            return response()->json($sale, 201);
        });
    }

    public function refund(Request $request, Sale $sale)
    {
        abort_unless($sale->merchant_id === $this->merchantId($request), 404);
        $sale->update(['status' => 'refunded']);
        $sale->order?->update(['payment_status' => 'refunded']);

        return $sale->fresh(['items', 'payments']);
    }

    public function receipt(Request $request, Sale $sale)
    {
        abort_unless($sale->merchant_id === $this->merchantId($request), 404);

        $document = Document::where('sale_id', $sale->id)
            ->where('document_type', 'receipt')
            ->latest()
            ->first();

        if (!$document) {
            $document = Document::create([
                'merchant_id' => $sale->merchant_id,
                'order_id' => $sale->order_id,
                'sale_id' => $sale->id,
                'document_type' => 'receipt',
                'document_number' => 'RCPT-' . $sale->invoice_number,
                'format' => 'text',
                'status' => 'generated',
                'content_text' => $this->buildReceiptText($sale),
            ]);
        }

        return $document;
    }
}
