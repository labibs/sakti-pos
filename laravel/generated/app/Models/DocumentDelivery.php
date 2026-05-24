<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentDelivery extends Model
{
    protected $fillable = ['document_id', 'channel', 'recipient', 'status', 'sent_at', 'error_message'];

    protected $casts = ['sent_at' => 'datetime'];
}
