<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'subtotal',
        'shipping_cost',
        'total_amount',
        'payment_method',
        'payment_status',
        'snap_token',
        'ginee_order_id',
        'coupon_code',
        'coupon_discount',
        'bank_account_id',
        'payment_proof',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'shipping_cost' => 'float',
        'total_amount' => 'float',
        'coupon_discount' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shipping(): HasOne
    {
        return $this->hasOne(OrderShipping::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }
}
