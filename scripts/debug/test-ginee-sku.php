<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Services\GineeService;
use Illuminate\Contracts\Console\Kernel;

echo "Mencari produk dengan SKU 'DRESS FLEURA - BLUE M' di Ginee API (Master Products)...\n";

$ginee = new GineeService;
$page = 0;
$size = 100;
$found = false;

while (true) {
    $response = $ginee->getProducts($page, $size);
    if (empty($response['content'])) {
        break;
    }

    foreach ($response['content'] as $product) {
        $productStr = json_encode($product);
        if (stripos($productStr, 'DRESS FLEURA - BLUE M') !== false || stripos($productStr, 'DRESS FLEURA') !== false) {
            echo "==========================================\n";
            echo 'Produk Ditemukan di halaman '.($page + 1)."!\n";
            echo 'ID Produk Master: '.$product['id']."\n";
            echo 'Nama Produk: '.$product['name']."\n";
            echo json_encode($product, JSON_PRETTY_PRINT)."\n";
            $found = true;
            break 2;
        }
    }

    if (count($response['content']) < $size) {
        break;
    }

    $page++;
}

if (! $found) {
    echo "Tidak ada Master Product yang memiliki SKU/Nama yang cocok dengan 'DRESS FLEURA - BLUE M'.\n";
}
