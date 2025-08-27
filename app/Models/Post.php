<?php

namespace App\Models;

use App\Traits\HasFiles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory, HasFiles;

    protected $fillable = [
        'title',
        'body',
    ];

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

    public function banner()
    {
        return $this->getFirstFileByRole('banner');
    }

    // Business logic helpers
    public function hasMedia(): bool
    {
        return $this->files()->exists();
    }

    public function getExcerpt(int $length = 100): string
    {
        return str($this->body)->limit($length);
    }
}
