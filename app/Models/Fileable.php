<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fileable extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_id',
        'fileable_id',
        'fileable_type',
        'role',
    ];

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    public function fileable()
    {
        return $this->morphTo();
    }

    // Helper methods
    public function isRole(string $role): bool
    {
        return $this->role === $role;
    }

    // Scopes for common queries
    public function scopeWithRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeForModel($query, Model $model)
    {
        return $query->where('fileable_type', get_class($model))
            ->where('fileable_id', $model->id);
    }
}
