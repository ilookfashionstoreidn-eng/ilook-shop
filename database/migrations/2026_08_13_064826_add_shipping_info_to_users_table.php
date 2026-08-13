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
        Schema::table('users', function (Blueprint $table) {
            // A single saved default shipping address per buyer, mirroring
            // the fields captured on order_shippings so it can later be
            // reused to prefill checkout.
            $table->text('address')->nullable()->after('phone');
            $table->string('kelurahan')->nullable()->after('address');
            $table->string('kecamatan')->nullable()->after('kelurahan');
            $table->string('rajaongkir_province_id')->nullable()->after('kecamatan');
            $table->string('province')->nullable()->after('rajaongkir_province_id');
            $table->string('rajaongkir_city_id')->nullable()->after('province');
            $table->string('city')->nullable()->after('rajaongkir_city_id');
            $table->string('postal_code')->nullable()->after('city');
            $table->decimal('latitude', 10, 7)->nullable()->after('postal_code');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'address', 'kelurahan', 'kecamatan',
                'rajaongkir_province_id', 'province',
                'rajaongkir_city_id', 'city',
                'postal_code', 'latitude', 'longitude',
            ]);
        });
    }
};
