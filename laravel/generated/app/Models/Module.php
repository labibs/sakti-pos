<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['code', 'name', 'description', 'is_core'];

    protected $casts = ['is_core' => 'boolean'];
}
