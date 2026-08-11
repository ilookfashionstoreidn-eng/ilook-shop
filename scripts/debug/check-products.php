<?php

require __DIR__.'/../../vendor/autoload.php';

$app = require_once __DIR__.'/../../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Product;
use Illuminate\Contracts\Console\Kernel;

echo 'Total Products: '.Product::count()."\n";
echo 'Total Categories: '.Category::count()."\n";

echo "\n--- Product Status List ---\n";
foreach (Product::all() as $p) {
    echo "ID: {$p->id} | Name: {$p->name} | Status: {$p->status} | Category ID: {$p->category_id}\n";
}
