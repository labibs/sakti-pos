<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    protected $fillable = ['order_id', 'status_type', 'from_status', 'to_status', 'notes', 'created_by'];

    const UPDATED_AT = null;
}
