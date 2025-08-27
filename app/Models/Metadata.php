<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Metadata extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_id',
        'key',
        'value',
    ];

    protected $hidden = [
        'created_at', 'updated_at',
    ];

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    // Helper methods
    public function isKey(string $key): bool
    {
        return $this->key === $key;
    }

    // Scopes for common queries
    public function scopeWithKey($query, string $key)
    {
        return $query->where('key', $key);
    }

    public function scopeForFile($query, File $file)
    {
        return $query->where('file_id', $file->id);
    }
}
