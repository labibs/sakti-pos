<?php

namespace App\Http\Controllers\Api;

use App\Models\CatalogCategory;
use Illuminate\Http\Request;

class CatalogCategoryController extends PosApiController
{
    public function index(Request $request)
    {
        return CatalogCategory::where('merchant_id', $this->merchantId($request))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'parent_id' => ['nullable', 'integer'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['merchant_id'] = $this->merchantId($request);

        return response()->json(CatalogCategory::create($data), 201);
    }

    public function update(Request $request, CatalogCategory $category)
    {
        abort_unless($category->merchant_id === $this->merchantId($request), 404);

        $category->update($request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'parent_id' => ['nullable', 'integer'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]));

        return $category;
    }

    public function destroy(Request $request, CatalogCategory $category)
    {
        abort_unless($category->merchant_id === $this->merchantId($request), 404);
        $category->delete();

        return response()->noContent();
    }
}
