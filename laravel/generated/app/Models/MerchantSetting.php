<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantSetting extends Model
{
    protected $fillable = ['merchant_id', 'key', 'value_json'];

    protected $casts = ['value_json' => 'array'];
}
