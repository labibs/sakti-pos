<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantModule extends Model
{
    protected $fillable = ['merchant_id', 'module_code', 'is_enabled', 'config_json'];

    protected $casts = [
        'is_enabled' => 'boolean',
        'config_json' => 'array',
    ];
}
