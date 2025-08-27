<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function index(Request $request)
    {
        $query = File::with('metadata');

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

        return $query->paginate(10);
    }
}
