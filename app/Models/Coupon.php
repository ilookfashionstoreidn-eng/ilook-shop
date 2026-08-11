<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_spend',
        'usage_limit',
        'used_count',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'value' => 'float',
        'min_spend' => 'float',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /**
     * Check if the coupon is valid and active.
     */
    public function isValidForSubtotal(float $subtotal): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($this->expires_at && Carbon::now()->greaterThan($this->expires_at)) {
            return false;
        }

        if ($subtotal < $this->min_spend) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount for a given subtotal.
     */
    public function calculateDiscount(float $subtotal): float
    {
        if (! $this->isValidForSubtotal($subtotal)) {
            return 0.00;
        }

        if ($this->type === 'percentage') {
            return round($subtotal * ($this->value / 100), 2);
        }

        // Fixed discount
        return min($this->value, $subtotal);
    }
}
