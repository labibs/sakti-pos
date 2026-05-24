<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalogItem extends Model
{
    protected $fillable = [
        'merchant_id', 'category_id', 'item_type', 'name', 'sku', 'barcode', 'description',
        'base_price', 'cost_price', 'unit', 'track_stock', 'stock_qty', 'is_active', 'metadata_json',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock_qty' => 'decimal:3',
        'track_stock' => 'boolean',
        'is_active' => 'boolean',
        'metadata_json' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(CatalogCategory::class, 'category_id');
    }
}
