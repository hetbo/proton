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

    protected $hidden = [
        'created_at', 'updated_at', 'fileable_type'
    ];

    protected $appends = ['type'];

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    public function fileable()
    {
        return $this->morphTo();
    }

    public function isRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function scopeWithRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeForModel($query, Model $model)
    {
        return $query->where('fileable_type', get_class($model))
            ->where('fileable_id', $model->id);
    }

    public function getTypeAttribute(): ?string
    {
        if (!$this->fileable_type) {
            return null;
        }

        return class_basename($this->fileable_type);
    }


}
