<?php

namespace App\Http\Controllers\Api;

use App\Models\CatalogItem;
use Illuminate\Http\Request;

class CatalogItemController extends PosApiController
{
    public function index(Request $request)
    {
        $merchantId = $this->merchantId($request);
        $query = CatalogItem::with('category')->where('merchant_id', $merchantId);

        if ($request->filled('q')) {
            $search = $request->query('q');
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('item_type')) {
            $query->where('item_type', $request->query('item_type'));
        }

        return $query->orderBy('name')->paginate((int) $request->query('per_page', 50));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['merchant_id'] = $this->merchantId($request);

        return response()->json(CatalogItem::create($data), 201);
    }

    public function show(Request $request, CatalogItem $item)
    {
        abort_unless($item->merchant_id === $this->merchantId($request), 404);

        return $item->load('category');
    }

    public function update(Request $request, CatalogItem $item)
    {
        abort_unless($item->merchant_id === $this->merchantId($request), 404);
        $item->update($this->validated($request, true));

        return $item->fresh('category');
    }

    public function destroy(Request $request, CatalogItem $item)
    {
        abort_unless($item->merchant_id === $this->merchantId($request), 404);
        $item->delete();

        return response()->noContent();
    }

    public function barcode(Request $request, string $barcode)
    {
        return CatalogItem::where('merchant_id', $this->merchantId($request))
            ->where('barcode', $barcode)
            ->firstOrFail();
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'category_id' => ['nullable', 'integer'],
            'item_type' => [$prefix, 'in:product,service,package,ticket,shipment,rental,custom'],
            'name' => [$prefix, 'string', 'max:180'],
            'sku' => ['nullable', 'string', 'max:100'],
            'barcode' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'base_price' => [$prefix, 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:30'],
            'track_stock' => ['nullable', 'boolean'],
            'stock_qty' => ['nullable', 'numeric'],
            'is_active' => ['nullable', 'boolean'],
            'metadata_json' => ['nullable', 'array'],
        ]);
    }
}
