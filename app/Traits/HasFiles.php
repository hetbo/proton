<?php

namespace App\Traits;

use App\Models\File;
use App\Models\Fileable;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Collection;

trait HasFiles
{
    public function files(): MorphToMany
    {
        return $this->morphToMany(File::class, 'fileable')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function fileables(): MorphMany
    {
        return $this->morphMany(Fileable::class, 'fileable');
    }

    public function attachFile(File $file, string $role): Fileable
    {
        return $this->fileables()->create([
            'file_id' => $file->id,
            'role' => $role,
        ]);
    }

    public function detachFile(File $file, string $role): bool
    {
        return $this->fileables()
                ->where('file_id', $file->id)
                ->where('role', $role)
                ->delete() > 0;
    }

    public function detachAllFiles(?string $role = null): bool
    {
        $query = $this->fileables();

        if ($role) {
            $query->where('role', $role);
        }

        return $query->delete() > 0;
    }

    public function getFilesByRole(string $role): Collection
    {
        return $this->files()
            ->wherePivot('role', $role)
            ->get();
    }

    public function hasFile(File $file, ?string $role = null): bool
    {
        $query = $this->fileables()->where('file_id', $file->id);

        if ($role) {
            $query->where('role', $role);
        }

        return $query->exists();
    }

    public function syncFiles(array $fileIds, string $role): void
    {
        // Remove existing files for this role
        $this->fileables()->where('role', $role)->delete();

        // Add new files
        foreach ($fileIds as $fileId) {
            $this->fileables()->create([
                'file_id' => $fileId,
                'role' => $role,
            ]);
        }
    }

    public function getFirstFileByRole(string $role): ?File
    {
        return $this->getFilesByRole($role)->first();
    }

    public function getFileRoles(): Collection
    {
        return $this->fileables()
            ->select('role')
            ->distinct()
            ->pluck('role');
    }

    public function getFilesWithRole(string $role): Collection
    {
        return $this->fileables()
            ->with('file')
            ->where('role', $role)
            ->get();
    }
}
