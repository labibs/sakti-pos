<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $fillable = [
        'merchant_id', 'order_id', 'sale_id', 'document_type', 'document_number',
        'format', 'status', 'file_url', 'content_text', 'metadata_json',
    ];

    protected $casts = ['metadata_json' => 'array'];

    public function deliveries(): HasMany
    {
        return $this->hasMany(DocumentDelivery::class);
    }
}
