<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantProfile extends Model
{
    protected $fillable = ['merchant_id', 'logo_url', 'phone', 'email', 'address', 'tax_number', 'receipt_footer'];
}
