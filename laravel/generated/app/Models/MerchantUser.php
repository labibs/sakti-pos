<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantUser extends Model
{
    protected $fillable = ['merchant_id', 'user_id', 'role_code', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
