<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The original migration made `sku` globally unique across every
     * product, but Ginee's catalog reuses the same SKU string (e.g. "SET
     * MAUNA - MAGENTA M") across different master products, which crashed
     * a full catalog sync with a duplicate-entry error. SKUs only need to
     * be unique within a single product.
     */
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropUnique('product_variants_sku_unique');
            $table->unique(['product_id', 'sku']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropUnique(['product_id', 'sku']);
            $table->unique('sku');
        });
    }
};
