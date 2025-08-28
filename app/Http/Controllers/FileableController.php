<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Traits\HasFiles;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class FileableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
            'role' => 'nullable|string',
        ]);

        $model = $this->resolveModel($data['type'], $data['id']);

        $files = ($data['role'] ?? null)
            ? $model->getFilesByRole($data['role'])
            : $model->files;

        return response()->json([
            'success' => true,
            'data' => $files,
        ]);
    }

    public function attach(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
            'file_id' => 'required|exists:files,id',
            'role' => 'required|string',
        ]);

        try {
            $model = $this->resolveModel($data['type'], $data['id']);
            $file = File::findOrFail($data['file_id']);

            $model->attachFile($file, $data['role']);

            return response()->json([
                'success' => true,
                'message' => 'File attached successfully.',
                'data' => [
                    'file_id' => $file->id,
                    'fileable_type' => $data['type'],
                    'fileable_id' => $data['id'],
                    'role' => $data['role'],
                ],
            ], 201);

        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'This file is already attached with the same role.',
                ], 409);
            }
            throw $e;
        }
    }

    public function detach(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
            'file_id' => 'required|exists:files,id',
            'role' => 'nullable|string',
        ]);

        $model = $this->resolveModel($data['type'], $data['id']);
        $file = File::findOrFail($data['file_id']);

        $detached = ($data['role'] ?? null)
            ? $model->detachFile($file, $data['role'])
            : $model->fileables()->where('file_id', $file->id)->delete() > 0;

        if (!$detached) {
            return response()->json([
                'success' => false,
                'message' => 'File was not attached or already detached.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'File detached successfully.',
            'data' => [
                'file_id' => $file->id,
                'fileable_type' => $data['type'],
                'fileable_id' => $data['id'],
                'role' => ($data['role'] ?? 'all'),
            ],
        ]);
    }

    private function resolveModel(string $type, int $id)
    {
        $modelClass = $this->resolveModelClass($type);

        $this->validateModelClass($modelClass, $type);

        $model = $modelClass::find($id);

        if (!$model) {
            throw ValidationException::withMessages([
                'id' => "{$type} with id {$id} not found."
            ]);
        }

        return $model;
    }

    private function resolveModelClass(string $type): string
    {
        return "App\\Models\\" . Str::studly($type);
    }

    private function validateModelClass(string $modelClass, string $type): void
    {
        if (!class_exists($modelClass)) {
            throw ValidationException::withMessages([
                'type' => "Invalid model type [{$type}]."
            ]);
        }

        if (!in_array(HasFiles::class, class_uses_recursive($modelClass))) {
            throw ValidationException::withMessages([
                'type' => "Model {$type} does not support file attachments."
            ]);
        }
    }
}
