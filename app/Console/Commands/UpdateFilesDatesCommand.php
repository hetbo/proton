<?php

namespace App\Console\Commands;

use App\Models\File;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateFilesDatesCommand extends Command
{
    protected $signature = 'files:update-dates';

    protected $description = 'Update all files with random created_at dates from 3 years ago till now';

    public function handle(): int
    {
        $this->info('Starting to update file dates...');

        $files = File::all();
        $totalFiles = $files->count();

        if ($totalFiles === 0) {
            $this->warn('No files found in the database.');
            return self::SUCCESS;
        }

        $this->info("Found {$totalFiles} files to update.");

        $startDate = Carbon::now()->subYears(3);
        $endDate = Carbon::now();

        $progressBar = $this->output->createProgressBar($totalFiles);
        $progressBar->start();

        $updated = 0;

        foreach ($files as $file) {
            $randomDate = Carbon::createFromTimestamp(
                mt_rand($startDate->timestamp, $endDate->timestamp)
            );

            $updatedAt = $randomDate->copy()->addDays(rand(0, 30));

            if ($updatedAt->greaterThan($endDate)) {
                $updatedAt = $endDate->copy();
            }

            $file->timestamps = false;
            $file->created_at = $randomDate;
            $file->updated_at = $updatedAt;
            $file->save();

            $updated++;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("Successfully updated {$updated} files.");
        $this->info('Date range: ' . $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'));

        return self::SUCCESS;
    }
}
