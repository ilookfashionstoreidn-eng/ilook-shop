<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderShipping extends Model
{
    protected $fillable = [
        'order_id',
        'courier',
        'service',
        'courier_name',
        'tracking_number',
        'rajaongkir_city_id',
        'recipient_name',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
