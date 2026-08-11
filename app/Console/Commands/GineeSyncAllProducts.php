<?php

namespace App\Console\Commands;

use App\Services\GineeService;
use Illuminate\Console\Command;

class GineeSyncAllProducts extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'ginee:sync-all {--page-size=100 : Products requested per Ginee API page}';

    /**
     * The console command description.
     */
    protected $description = 'Pull the entire product catalog from Ginee (paginating through every page) into the local database.';

    public function handle(GineeService $gineeService): int
    {
        $pageSize = (int) $this->option('page-size');

        $this->info('Fetching product catalog from Ginee...');
        $fetchBar = null;
        $priceBar = null;
        $saveBar = null;

        $result = $gineeService->syncAllProducts($pageSize, function (string $stage, int $done, int $total) use (&$fetchBar, &$priceBar, &$saveBar) {
            switch ($stage) {
                case 'fetch':
                    if (! $fetchBar) {
                        $this->line('');
                        $this->info("Paginating product list (total: {$total})");
                        $fetchBar = $this->output->createProgressBar($total);
                        $fetchBar->start();
                    }
                    $fetchBar->setProgress($done);
                    if ($done >= $total) {
                        $fetchBar->finish();
                        $this->line('');
                    }
                    break;
                case 'price':
                    if (! $priceBar) {
                        $this->line('');
                        $this->info('Fetching variant prices/images...');
                        $priceBar = $this->output->createProgressBar($total);
                        $priceBar->start();
                    }
                    $priceBar->setProgress($done);
                    if ($done >= $total) {
                        $priceBar->finish();
                        $this->line('');
                    }
                    break;
                case 'save':
                    if (! $saveBar) {
                        $this->line('');
                        $this->info('Saving products to database...');
                        $saveBar = $this->output->createProgressBar($total);
                        $saveBar->start();
                    }
                    $saveBar->setProgress($done);
                    if ($done >= $total) {
                        $saveBar->finish();
                        $this->line('');
                    }
                    break;
            }
        });

        $this->newLine();
        $this->info("Done. Imported {$result['imported']} of {$result['fetched']} fetched products (Ginee total: {$result['total']}).");

        return self::SUCCESS;
    }
}
