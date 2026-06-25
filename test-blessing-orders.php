<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\GineeService;

$ginee = new GineeService();

echo "Testing Blessing Integration Key on other endpoints:\n";

// 1. Shop list
$uriShop = '/openapi/shop/v1/list';
$sigShop = base64_encode(hash_hmac('sha256', "POST\${$uriShop}\$", env('GINEE_SECRET_KEY'), true));
$headersShop = [
    'Content-Type' => 'application/json',
    'X-Advai-Country' => env('GINEE_COUNTRY', 'ID'),
    'Authorization' => env('GINEE_ACCESS_KEY') . ':' . $sigShop,
];
$respShop = Http::withHeaders($headersShop)->post(env('GINEE_API_URL') . $uriShop, ['page' => 0, 'size' => 50]);
echo "\n--- Shop List Response (Status: " . $respShop->status() . ") ---\n";
print_r($respShop->json());

// 2. Warehouse search
$uriWH = '/openapi/warehouse/v1/search';
$sigWH = base64_encode(hash_hmac('sha256', "POST\${$uriWH}\$", env('GINEE_SECRET_KEY'), true));
$headersWH = [
    'Content-Type' => 'application/json',
    'X-Advai-Country' => env('GINEE_COUNTRY', 'ID'),
    'Authorization' => env('GINEE_ACCESS_KEY') . ':' . $sigWH,
];
$respWH = Http::withHeaders($headersWH)->post(env('GINEE_API_URL') . $uriWH, ['page' => 0, 'size' => 50]);
echo "\n--- Warehouse Search Response (Status: " . $respWH->status() . ") ---\n";
print_r($respWH->json());

// 3. Order list
$uriOrder = '/openapi/order/v1/list'; // wait, order list path is usually /openapi/order/v1/list or /openapi/order/v1/query? Let's test /openapi/order/v1/list
$sigOrder = base64_encode(hash_hmac('sha256', "POST\${$uriOrder}\$", env('GINEE_SECRET_KEY'), true));
$headersOrder = [
    'Content-Type' => 'application/json',
    'X-Advai-Country' => env('GINEE_COUNTRY', 'ID'),
    'Authorization' => env('GINEE_ACCESS_KEY') . ':' . $sigOrder,
];
$respOrder = Http::withHeaders($headersOrder)->post(env('GINEE_API_URL') . $uriOrder, ['page' => 0, 'size' => 50]);
echo "\n--- Order List Response (Status: " . $respOrder->status() . ") ---\n";
print_r($respOrder->json());
