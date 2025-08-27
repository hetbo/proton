<?php

namespace App\Models;

use App\Traits\HasFiles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory, HasFiles;

    protected $fillable = [
        'name',
        'description',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
        ];
    }

    // Convenience methods for common file roles
    public function thumbnail()
    {
        return $this->getFirstFileByRole('thumbnail');
    }

    public function gallery()
    {
        return $this->getFilesByRole('gallery');
    }

    public function attachments()
    {
        return $this->getFilesByRole('attachment');
    }

    // Business logic helpers
    public function hasImages(): bool
    {
        return $this->getFilesByRole('thumbnail')->isNotEmpty() ||
            $this->getFilesByRole('gallery')->isNotEmpty();
    }

    public function getFormattedPrice(): string
    {
        return '$' . number_format($this->price / 100, 2);
    }
}
