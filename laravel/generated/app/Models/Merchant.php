<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Merchant extends Model
{
    protected $fillable = ['name', 'business_type', 'status', 'owner_user_id'];

    public function profile(): HasOne
    {
        return $this->hasOne(MerchantProfile::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(MerchantModule::class);
    }
}
