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
            $table->boolean('is_new_arrival')->default(false)->after('status');
            // Set only when toggled on — used to order the homepage "New
            // Arrivals" picks by most-recently-featured, independent of
            // unrelated edits touching updated_at.
            $table->timestamp('new_arrival_marked_at')->nullable()->after('is_new_arrival');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_new_arrival', 'new_arrival_marked_at']);
        });
    }
};
