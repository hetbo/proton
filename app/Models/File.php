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

    public function formatSize(): string
    {
        if (!$this->size) return 'Unknown size';

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->size;

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
