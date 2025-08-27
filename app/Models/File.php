<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'path',
        'mime_type',
        'size',
    ];

    protected $hidden = [
        'size', 'mime_type'
    ];

    protected $appends = ['formatted_size', 'type'];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function metadata()
    {
        return $this->hasMany(Metadata::class);
    }

    public function fileables()
    {
        return $this->hasMany(Fileable::class);
    }

    // Get all models that use this file
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'fileable');
    }

    public function products()
    {
        return $this->morphedByMany(Product::class, 'fileable');
    }

    public function users()
    {
        return $this->morphedByMany(User::class, 'fileable');
    }

    // Helper methods
    public function getMetadataByKey(string $key): ?string
    {
        return $this->metadata()->where('key', $key)->value('value');
    }

    public function hasMetadata(string $key): bool
    {
        return $this->metadata()->where('key', $key)->exists();
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type ?? '', 'image/');
    }

    public function isVideo(): bool
    {
        return str_starts_with($this->mime_type ?? '', 'video/');
    }

    public function getFormattedSizeAttribute(): string
    {
        if (!$this->size) return 'Unknown size';

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->size;

        for ($i = 0; $bytes > 1023 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getTypeAttribute(): string
    {
        if (!$this->mime_type) {
            return 'unknown';
        }

        $mime = strtolower($this->mime_type);

        // Primary type mapping (most common first for performance)
        $typeMap = [
            // Images
            'image/' => 'image',

            // Videos
            'video/' => 'video',

            // Audio
            'audio/' => 'audio',

            // Text files
            'text/' => 'text',

            // Archives & Compressed files
            'application/zip' => 'archive',
            'application/x-zip-compressed' => 'archive',
            'application/x-rar-compressed' => 'archive',
            'application/x-7z-compressed' => 'archive',
            'application/gzip' => 'archive',
            'application/x-tar' => 'archive',
            'application/x-bzip2' => 'archive',

            // Documents (PDF)
            'application/pdf' => 'document',

            // Microsoft Office Documents
            'application/msword' => 'document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'document',
            'application/rtf' => 'document',
            'application/vnd.oasis.opendocument.text' => 'document',

            // Spreadsheets
            'application/vnd.ms-excel' => 'spreadsheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'spreadsheet',
            'application/vnd.oasis.opendocument.spreadsheet' => 'spreadsheet',
            'text/csv' => 'spreadsheet',

            // Presentations
            'application/vnd.ms-powerpoint' => 'presentation',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'presentation',
            'application/vnd.oasis.opendocument.presentation' => 'presentation',

            // Code & Development
            'application/json' => 'code',
            'application/javascript' => 'code',
            'application/xml' => 'code',
            'text/html' => 'code',
            'text/css' => 'code',
            'text/javascript' => 'code',
            'application/x-php' => 'code',
            'application/x-python-code' => 'code',

            // Fonts
            'font/' => 'font',
            'application/font-woff' => 'font',
            'application/font-woff2' => 'font',
            'application/vnd.ms-fontobject' => 'font',

            // Executable & System files
            'application/x-executable' => 'executable',
            'application/x-msdos-program' => 'executable',
            'application/x-msdownload' => 'executable',
            'application/x-apple-diskimage' => 'executable',
            'application/x-debian-package' => 'executable',

            // CAD & Design
            'application/dwg' => 'design',
            'application/dxf' => 'design',
            'image/vnd.adobe.photoshop' => 'design',
            'application/postscript' => 'design',

            // 3D Models
            'model/' => '3d',
            'application/octet-stream' => 'binary', // Generic binary
        ];

        // Check for exact matches first (more specific)
        if (isset($typeMap[$mime])) {
            return $typeMap[$mime];
        }

        // Check for prefix matches (e.g., 'image/', 'video/')
        foreach ($typeMap as $pattern => $type) {
            if (str_ends_with($pattern, '/') && str_starts_with($mime, $pattern)) {
                return $type;
            }
        }

        // Fallback for common patterns not caught above
        return match (true) {
            str_contains($mime, 'sheet') => 'spreadsheet',
            str_contains($mime, 'document') => 'document',
            str_contains($mime, 'presentation') => 'presentation',
            str_contains($mime, 'word') => 'document',
            str_contains($mime, 'excel') => 'spreadsheet',
            str_contains($mime, 'powerpoint') => 'presentation',
            str_contains($mime, 'compressed') => 'archive',
            str_contains($mime, 'zip') => 'archive',
            default => 'other'
        };
    }

// Alternative static method approach for better maintainability
    public static function getMimeTypeCategories(): array
    {
        return [
            'image' => [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
                'image/x-icon', 'image/vnd.microsoft.icon'
            ],
            'video' => [
                'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
                'video/webm', 'video/ogg', 'video/3gpp', 'video/x-flv'
            ],
            'audio' => [
                'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
                'audio/aac', 'audio/flac', 'audio/x-ms-wma'
            ],
            'document' => [
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/rtf', 'application/vnd.oasis.opendocument.text'
            ],
            'spreadsheet' => [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.oasis.opendocument.spreadsheet',
                'text/csv'
            ],
            'presentation' => [
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.oasis.opendocument.presentation'
            ],
            'archive' => [
                'application/zip', 'application/x-zip-compressed',
                'application/x-rar-compressed', 'application/x-7z-compressed',
                'application/gzip', 'application/x-tar'
            ],
            'text' => [
                'text/plain', 'text/html', 'text/css', 'text/javascript',
                'text/xml', 'text/markdown'
            ],
            'code' => [
                'application/json', 'application/javascript', 'application/xml',
                'text/html', 'text/css', 'application/x-php'
            ]
        ];
    }

    public function getTypeAttributeAlternative(): string
    {
        if (!$this->mime_type) {
            return 'unknown';
        }

        $mime = strtolower($this->mime_type);
        $categories = self::getMimeTypeCategories();

        foreach ($categories as $type => $mimes) {
            if (in_array($mime, $mimes)) {
                return $type;
            }
        }

        // Check prefixes as fallback
        return match (true) {
            str_starts_with($mime, 'image/') => 'image',
            str_starts_with($mime, 'video/') => 'video',
            str_starts_with($mime, 'audio/') => 'audio',
            str_starts_with($mime, 'text/') => 'text',
            str_starts_with($mime, 'font/') => 'font',
            default => 'other'
        };
    }
}
