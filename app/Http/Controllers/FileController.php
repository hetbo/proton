<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function index(Request $request)
    {
        $query = File::with(['metadata', 'fileables']);

        if ($request->filled('type')) {
            $mimeTypes = match ($request->get('type')) {
                'image' => [
                    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
                ],
                'video' => [
                    'video/mp4', 'video/webm', 'video/ogg'
                ],
                'audio' => [
                    'audio/mpeg', 'audio/wav', 'audio/ogg'
                ],
                'document' => [
                    'application/pdf', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                ],
                'archive' => [
                    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
                ],
                default => [],
            };

            if (!empty($mimeTypes)) {
                $query->whereIn('mime_type', $mimeTypes);
            }
        }

        if ($request->filled('year')) {
            $query->whereYear('created_at', $request->get('year'));
        }

        if ($request->filled('month')) {
            $query->whereMonth('created_at', $request->get('month'));
        }

        if ($request->filled('sort')) {
            match ($request->get('sort')) {
                'date' => $query->orderBy('created_at'),
                'size' => $query->orderBy('size'),
                '-size' => $query->orderBy('size', 'desc'),
                default => $query->orderBy('created_at', 'desc'),
            };
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if (request()->filled('search')) {
            $query->where('filename', 'like', '%' . request('search') . '%');
        }

        return $query->paginate(10);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $file = $request->file('file');
        $originalFilename = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType();
        $size = $file->getSize();

        $storedFilePath = $file->store('shelf/' . date('Y/m'), 'public');

        $newFile = File::create([
            'filename' => $originalFilename,
            'path' => $storedFilePath,
            'mime_type' => $mimeType,
            'size' => $size,
        ]);

        return response()->json($newFile, 201);
    }

    public function delete(Request $request)
    {

        $request->validate([
            'id' => 'required|exists:files,id',
        ]);

        $file = File::findOrFail($request->id);

        try {
            DB::transaction(function () use ($file) {
                if ($file->delete()) {
                    Storage::disk('public')->delete($file->path);
                }
            });

            return response()->json(['message' => 'File deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'File could not be deleted.'], 500);
        }
    }

    public function replace(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:files,id',
            'file' => 'required|file',
        ]);

        $existingFile = File::findOrFail($request->id);
        $newFile = $request->file('file');

        try {
            DB::transaction(function () use ($existingFile, $newFile) {

                Storage::disk('public')->delete($existingFile->path);

                $newFile->storeAs(dirname($existingFile->path), basename($existingFile->path), 'public');

                $existingFile->update([
                    'filename' => $newFile->getClientOriginalName(),
                    'mime_type' => $newFile->getClientMimeType(),
                    'size' => $newFile->getSize(),
                ]);
            });

            return response()->json(['message' => 'File replaced successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'File could not be replaced.'], 500);
        }
    }
}
