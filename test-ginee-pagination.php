<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\GineeService;

$ginee = new GineeService();

// Let's test calling with raw HTTP to see the exact body response
$uri = '/openapi/product/master/v1/list';
$stringToSign = "POST\${$uri}\$";
$signature = base64_encode(hash_hmac('sha256', $stringToSign, env('GINEE_SECRET_KEY'), true));

$headers = [
    'Content-Type' => 'application/json',
    'X-Advai-Country' => env('GINEE_COUNTRY', 'ID'),
    'Authorization' => env('GINEE_ACCESS_KEY') . ':' . $signature,
];

echo "Testing with page = 1:\n";
$response = Http::withHeaders($headers)->post(env('GINEE_API_URL') . $uri, [
    'page' => 1,
    'size' => 50
]);
echo "Status: " . $response->status() . "\n";
print_r($response->json());

echo "\nTesting with page = 0:\n";
$response2 = Http::withHeaders($headers)->post(env('GINEE_API_URL') . $uri, [
    'page' => 0,
    'size' => 50
]);
echo "Status: " . $response2->status() . "\n";
print_r($response2->json());
