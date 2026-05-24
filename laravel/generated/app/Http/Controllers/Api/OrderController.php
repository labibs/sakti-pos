<?php

namespace App\Http\Controllers\Api;

use App\Models\CatalogItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends PosApiController
{
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'items'])
            ->where('merchant_id', $this->merchantId($request));

        foreach (['order_status', 'bill_status', 'payment_status', 'service_type', 'source'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->query($filter));
            }
        }

        return $query->latest()->paginate((int) $request->query('per_page', 30));
    }

    public function store(Request $request)
    {
        $merchantId = $this->merchantId($request);
        $data = $request->validate([
            'customer_id' => ['nullable', 'integer'],
            'business_module' => ['nullable', 'string', 'max:80'],
            'source' => ['nullable', 'in:cashier,waiter,customer_qr,admin,online,api'],
            'service_type' => ['nullable', 'in:dine_in,delivery,pickup,onsite_service,counter,shipment,ticket'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'service_charge_amount' => ['nullable', 'numeric', 'min:0'],
            'shipping_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'metadata_json' => ['nullable', 'array'],
            'items' => ['nullable', 'array'],
            'items.*.catalog_item_id' => ['nullable', 'integer'],
            'items.*.name' => ['nullable', 'string'],
            'items.*.qty' => ['required_with:items', 'numeric', 'min:0.001'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        return DB::transaction(function () use ($data, $merchantId, $request) {
            $order = Order::create([
                'merchant_id' => $merchantId,
                'customer_id' => $data['customer_id'] ?? null,
                'order_number' => $this->nextOrderNumber($merchantId),
                'business_module' => $data['business_module'] ?? 'pos',
                'source' => $data['source'] ?? 'cashier',
                'service_type' => $data['service_type'] ?? 'counter',
                'order_status' => 'draft',
                'bill_status' => 'open',
                'payment_status' => 'unpaid',
                'fulfillment_status' => 'pending',
                'discount_amount' => $data['discount_amount'] ?? 0,
                'tax_amount' => $data['tax_amount'] ?? 0,
                'service_charge_amount' => $data['service_charge_amount'] ?? 0,
                'shipping_amount' => $data['shipping_amount'] ?? 0,
                'notes' => $data['notes'] ?? null,
                'metadata_json' => $data['metadata_json'] ?? null,
                'opened_at' => now(),
                'created_by' => $this->userId($request),
            ]);

            foreach ($data['items'] ?? [] as $item) {
                $this->createOrderItem($order, $item, $merchantId);
            }

            return response()->json($this->recalculateOrder($order), 201);
        });
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($order->merchant_id === $this->merchantId($request), 404);

        return $order->load(['customer', 'items', 'sale.payments']);
    }

    public function addItem(Request $request, Order $order)
    {
        abort_unless($order->merchant_id === $this->merchantId($request), 404);
        abort_if($order->bill_status === 'closed', 422, 'Bill sudah closed.');

        $data = $request->validate([
            'catalog_item_id' => ['nullable', 'integer'],
            'item_type' => ['nullable', 'in:product,service,package,ticket,shipment,rental,custom'],
            'name' => ['nullable', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'qty' => ['required', 'numeric', 'min:0.001'],
            'unit' => ['nullable', 'string', 'max:30'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'metadata_json' => ['nullable', 'array'],
        ]);

        $item = $this->createOrderItem($order, $data, $order->merchant_id);

        return response()->json([
            'item' => $item,
            'order' => $this->recalculateOrder($order),
        ], 201);
    }

    public function updateItem(Request $request, Order $order, OrderItem $item)
    {
        abort_unless($order->merchant_id === $this->merchantId($request) && $item->order_id === $order->id, 404);
        abort_if($order->bill_status === 'closed', 422, 'Bill sudah closed.');

        $data = $request->validate([
            'qty' => ['sometimes', 'numeric', 'min:0.001'],
            'unit_price' => ['sometimes', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:pending,processing,ready,fulfilled,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        $qty = $data['qty'] ?? $item->qty;
        $unitPrice = $data['unit_price'] ?? $item->unit_price;
        $discount = $data['discount_amount'] ?? $item->discount_amount;
        $tax = $data['tax_amount'] ?? $item->tax_amount;
        $data['total'] = max(($qty * $unitPrice) - $discount + $tax, 0);

        $item->update($data);

        return ['item' => $item->fresh(), 'order' => $this->recalculateOrder($order)];
    }

    public function removeItem(Request $request, Order $order, OrderItem $item)
    {
        abort_unless($order->merchant_id === $this->merchantId($request) && $item->order_id === $order->id, 404);
        abort_if($order->bill_status === 'closed', 422, 'Bill sudah closed.');
        $item->delete();

        return ['order' => $this->recalculateOrder($order)];
    }

    public function closeBill(Request $request, Order $order)
    {
        return $this->changeBill($request, $order, 'closed');
    }

    public function reopenBill(Request $request, Order $order)
    {
        return $this->changeBill($request, $order, 'open');
    }

    public function updateStatus(Request $request, Order $order)
    {
        abort_unless($order->merchant_id === $this->merchantId($request), 404);
        $data = $request->validate([
            'order_status' => ['nullable', 'in:draft,confirmed,processing,ready,completed,cancelled'],
            'fulfillment_status' => ['nullable', 'in:pending,in_progress,ready,fulfilled,returned'],
            'notes' => ['nullable', 'string'],
        ]);

        foreach (['order_status', 'fulfillment_status'] as $field) {
            if (isset($data[$field]) && $data[$field] !== $order->{$field}) {
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status_type' => $field,
                    'from_status' => $order->{$field},
                    'to_status' => $data[$field],
                    'notes' => $data['notes'] ?? null,
                    'created_by' => $this->userId($request),
                ]);
            }
        }

        $order->update($data);

        return $order->fresh(['items', 'customer']);
    }

    public function cancel(Request $request, Order $order)
    {
        abort_unless($order->merchant_id === $this->merchantId($request), 404);
        $order->update([
            'order_status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return $order->fresh();
    }

    private function changeBill(Request $request, Order $order, string $status): Order
    {
        abort_unless($order->merchant_id === $this->merchantId($request), 404);
        $order->update([
            'bill_status' => $status,
            'closed_at' => $status === 'closed' ? now() : null,
        ]);

        return $order->fresh(['items', 'customer']);
    }

    private function createOrderItem(Order $order, array $data, int $merchantId): OrderItem
    {
        $catalogItem = null;
        if (!empty($data['catalog_item_id'])) {
            $catalogItem = CatalogItem::where('merchant_id', $merchantId)->findOrFail($data['catalog_item_id']);
        }

        $qty = (float) $data['qty'];
        $unitPrice = (float) ($data['unit_price'] ?? $catalogItem?->base_price ?? 0);
        $discount = (float) ($data['discount_amount'] ?? 0);
        $tax = (float) ($data['tax_amount'] ?? 0);

        return OrderItem::create([
            'order_id' => $order->id,
            'catalog_item_id' => $catalogItem?->id,
            'item_type' => $data['item_type'] ?? $catalogItem?->item_type ?? 'custom',
            'name' => $data['name'] ?? $catalogItem?->name ?? 'Custom Item',
            'description' => $data['description'] ?? $catalogItem?->description,
            'qty' => $qty,
            'unit' => $data['unit'] ?? $catalogItem?->unit ?? 'pcs',
            'unit_price' => $unitPrice,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'total' => max(($qty * $unitPrice) - $discount + $tax, 0),
            'notes' => $data['notes'] ?? null,
            'metadata_json' => $data['metadata_json'] ?? null,
        ]);
    }
}
