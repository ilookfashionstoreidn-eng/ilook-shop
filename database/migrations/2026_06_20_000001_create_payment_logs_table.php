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
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->nullable();       // Midtrans transaction_id
            $table->string('order_id_midtrans')->nullable();    // order_id dari Midtrans (= order_number)
            $table->string('payment_type')->nullable();         // bank_transfer, gopay, qris, dll
            $table->string('status')->nullable();               // settlement, pending, deny, cancel, expire
            $table->decimal('amount', 12, 2)->nullable();       // gross_amount
            $table->string('va_number')->nullable();            // nomor VA jika bank transfer
            $table->string('bank')->nullable();                 // bca, bni, bri, mandiri, dll
            $table->json('raw_response')->nullable();           // full response Midtrans
            $table->timestamp('paid_at')->nullable();           // waktu settlement
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};
