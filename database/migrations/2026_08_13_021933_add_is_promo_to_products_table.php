<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_promo')->default(false)->after('new_arrival_marked_at');
            // Same pattern as new_arrival_marked_at — stamped only when
            // toggled on, used to order the /promo page by most recent pin.
            $table->timestamp('promo_marked_at')->nullable()->after('is_promo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_promo', 'promo_marked_at']);
        });
    }
};
