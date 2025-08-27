<?php

namespace App\Console\Commands;

use App\Models\File;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class UpdateFilesCommand extends Command
{
    protected $signature = 'files:update-mime-and-path';

    protected $description = 'Update all files with random mime types and new path format';

    private array $mimeTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ];

    private array $extensionMap = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/ogg' => 'ogv',
        'audio/mpeg' => 'mp3',
        'audio/wav' => 'wav',
        'audio/ogg' => 'ogg',
        'application/pdf' => 'pdf',
        'application/msword' => 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/vnd.ms-excel' => 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
        'application/vnd.ms-powerpoint' => 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
        'application/zip' => 'zip',
        'application/x-rar-compressed' => 'rar',
        'application/x-7z-compressed' => '7z'
    ];

    public function handle(): int
    {
        $this->info('Starting to update files...');

        $files = File::all();
        $totalFiles = $files->count();

        if ($totalFiles === 0) {
            $this->warn('No files found in the database.');
            return self::SUCCESS;
        }

        $this->info("Found {$totalFiles} files to update.");

        $progressBar = $this->output->createProgressBar($totalFiles);
        $progressBar->start();

        $updated = 0;

        foreach ($files as $file) {

            $randomMimeType = $this->mimeTypes[array_rand($this->mimeTypes)];

            $extension = $this->extensionMap[$randomMimeType];

            $uuid = Str::uuid();
            $newPath = "/shelf/{$uuid}.{$extension}";

            $file->update([
                'mime_type' => $randomMimeType,
                'path' => $newPath
            ]);

            $updated++;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("Successfully updated {$updated} files.");
        $this->info('All files now have random mime types and new path format: /shelf/[uuid].[extension]');

        return self::SUCCESS;
    }
}
