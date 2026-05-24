<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'merchant_id', 'sale_id', 'method', 'amount', 'status', 'reference_number',
        'provider', 'paid_at', 'metadata_json',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'metadata_json' => 'array',
    ];
}
