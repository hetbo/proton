<?php

namespace App\Http\Controllers;

use App\Models\Metadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MetadataController extends Controller
{
    public function add(Request $request)
    {
        $request->validate([
            'file_id' => 'required|exists:files,id',
            'key' => 'required|string',
            'value' => 'required|string'
        ]);

        try {
            $meta = Metadata::create([
                'file_id' => request('file_id'),
                'key' => request('key'),
                'value' => request('value')
            ]);

            return response()->json($meta, 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Unable To Add This Metadata', 'code' => $e->getCode()]);
        }
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:metadata,id',
            'key' => 'required|string',
            'value' => 'required|string'
        ]);

        try {
            $meta = Metadata::find(request('id'));
            $meta->update([
                'key' => request('key'),
                'value' => request('value')
            ]);
            return response()->json($meta);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Unable To Update This Metadata']);
        }

    }

    public function delete(Request $request) {

        $request->validate([
            'id' => 'required|exists:metadata,id',
        ]);

        $meta = Metadata::find(request('id'));

        if ($meta->delete()) {
            return response()->json(['message' => 'Metadata Deleted Successfully']);
        }

        return response()->json(['message' => 'Unable To Delete This Metadata']);

    }

}
