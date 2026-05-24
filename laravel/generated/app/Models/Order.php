<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'merchant_id', 'customer_id', 'order_number', 'business_module', 'source', 'service_type',
        'order_status', 'bill_status', 'payment_status', 'fulfillment_status',
        'subtotal', 'discount_amount', 'tax_amount', 'service_charge_amount', 'shipping_amount', 'total',
        'notes', 'metadata_json', 'opened_at', 'closed_at', 'completed_at', 'cancelled_at', 'created_by',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'service_charge_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata_json' => 'array',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function sale(): HasOne
    {
        return $this->hasOne(Sale::class);
    }
}
