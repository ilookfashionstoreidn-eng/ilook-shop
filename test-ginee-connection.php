<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\GineeService;

echo "--- TESTING GINEE API KEY AND CONNECTIVITY ---\n";
echo "Access Key: " . env('GINEE_ACCESS_KEY') . "\n";
echo "Secret Key: " . env('GINEE_SECRET_KEY') . "\n";
echo "API URL: " . env('GINEE_API_URL') . "\n";

$ginee = new GineeService();

echo "\n1. Fetching Ginee Shops List...\n";
$shops = $ginee->getShops();
echo "Shops Response count: " . (is_array($shops) && isset($shops['list']) ? count($shops['list']) : 0) . "\n";
print_r($shops);

echo "\n2. Fetching Ginee Warehouses List...\n";
$warehouses = $ginee->getWarehouses();
echo "Warehouses Response count: " . (is_array($warehouses) && isset($warehouses['list']) ? count($warehouses['list']) : 0) . "\n";
print_r($warehouses);

echo "\n3. Fetching Ginee Master Products...\n";
$products = $ginee->getProducts(0, 5);
echo "Products Response count: " . (is_array($products) && isset($products['list']) ? count($products['list']) : 0) . "\n";
print_r($products);

echo "\n--- TEST COMPLETED ---\n";
