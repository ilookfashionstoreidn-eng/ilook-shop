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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('tax_amount', 15, 2)->default(0.00)->after('shipping_cost');
            $table->string('tax_charged_to', 20)->default('buyer')->after('tax_amount');
            $table->decimal('admin_fee', 15, 2)->default(0.00)->after('tax_charged_to');
            $table->string('admin_fee_charged_to', 20)->default('buyer')->after('admin_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['tax_amount', 'tax_charged_to', 'admin_fee', 'admin_fee_charged_to']);
        });
    }
};
