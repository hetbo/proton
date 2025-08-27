<?php

use App\Models\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->withoutMiddleware();
});

describe('FileController index method', function () {
    beforeEach(function () {
        File::factory()->create([
            'filename' => 'test-image.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1048576,
            'created_at' => '2023-01-15'
        ]);

        File::factory()->create([
            'filename' => 'test-video.mp4',
            'mime_type' => 'video/mp4',
            'size' => 5242880,
            'created_at' => '2023-02-20'
        ]);

        File::factory()->create([
            'filename' => 'test-document.pdf',
            'mime_type' => 'application/pdf',
            'size' => 2097152,
            'created_at' => '2024-03-10'
        ]);
    });

    it('returns paginated files without filters', function () {
        $this->get(route('files.index'))
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'filename', 'path', 'created_at', 'formatted_size', 'type']
                ],
                'total', 'per_page', 'current_page'
            ])
            ->assertJsonPath('total', 3)
            ->assertJsonPath('per_page', 10)
            ->assertJsonCount(3, 'data');
    });

    it('filters files by image type', function () {
        $this->get(route('files.index', ['type' => 'image']))
            ->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.type', 'image')
            ->assertJsonPath('data.0.filename', 'test-image.jpg');
    });

    it('filters files by video type', function () {
        $this->get(route('files.index', ['type' => 'video']))
            ->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.type', 'video')
            ->assertJsonPath('data.0.filename', 'test-video.mp4');
    });

    it('filters files by document type', function () {
        $this->get(route('files.index', ['type' => 'document']))
            ->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.type', 'document')
            ->assertJsonPath('data.0.filename', 'test-document.pdf');
    });

    it('returns empty result for unsupported file type', function () {
        $this->get(route('files.index', ['type' => 'unsupported']))
            ->assertStatus(200)
            ->assertJsonPath('total', 3)
            ->assertJsonCount(3, 'data');
    });

    it('filters files by year', function () {
        $this->get(route('files.index', ['year' => 2023]))
            ->assertStatus(200)
            ->assertJsonPath('total', 2);
    });

    it('filters files by month', function () {
        $this->get(route('files.index', ['month' => 1]))
            ->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.filename', 'test-image.jpg');
    });

    it('filters files by year and month', function () {
        $this->get(route('files.index', ['year' => 2023, 'month' => 2]))
            ->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.filename', 'test-video.mp4');
    });

    it('sorts files by date ascending', function () {
        $response = $this->get(route('files.index', ['sort' => 'date']))->assertStatus(200);
        $data = $response->json('data');

        expect($data[0]['created_at'])->toContain('2023-01-15')
            ->and($data[2]['created_at'])->toContain('2024-03-10');
    });

    it('sorts files by size ascending', function () {
        $response = $this->get(route('files.index', ['sort' => 'size']))->assertStatus(200);
        $data = $response->json('data');

        expect($data[0]['formatted_size'])->toBe('1 MB')
            ->and($data[2]['formatted_size'])->toBe('5 MB');
    });

    it('sorts files by size descending', function () {
        $response = $this->get(route('files.index', ['sort' => '-size']))->assertStatus(200);
        $data = $response->json('data');

        expect($data[0]['formatted_size'])->toBe('5 MB')
            ->and($data[2]['formatted_size'])->toBe('1 MB');
    });

    it('defaults to sorting by created_at desc', function () {
        $response = $this->get(route('files.index'))->assertStatus(200);
        $data = $response->json('data');

        expect($data[0]['created_at'])->toContain('2024-03-10')
            ->and($data[2]['created_at'])->toContain('2023-01-15');
    });

    it('searches files by filename', function () {
        $this->get(route('files.index', ['search' => 'image']))
            ->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.filename', 'test-image.jpg');
    });

    it('returns empty result for non-matching search', function () {
        $this->get(route('files.index', ['search' => 'nonexistent']))
            ->assertStatus(200)
            ->assertJsonPath('total', 0)
            ->assertJsonCount(0, 'data');
    });

    it('returns correct file attributes including appended ones', function () {
        $this->get(route('files.index'))
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'filename', 'path', 'created_at', 'formatted_size', 'type']
                ]
            ]);

        $response = $this->get(route('files.index'));
        $data = $response->json('data.0');

        expect($data)->not()->toHaveKey('size')
            ->and($data)->not()->toHaveKey('mime_type');
    });

    it('returns correct formatted size for different file sizes', function () {
        File::factory()->create(['filename' => 'small.txt', 'size' => 512]);
        File::factory()->create(['filename' => 'large.zip', 'size' => 1073741824]);

        $response = $this->get(route('files.index', ['search' => 'small']))->assertStatus(200);
        expect($response->json('data.0.formatted_size'))->toBe('512 B');

        $response = $this->get(route('files.index', ['search' => 'large']))->assertStatus(200);
        expect($response->json('data.0.formatted_size'))->toBe('1 GB');
    });

    it('returns correct type attribute for various mime types', function () {
        File::factory()->create(['filename' => 'audio.mp3', 'mime_type' => 'audio/mpeg']);
        File::factory()->create(['filename' => 'text.txt', 'mime_type' => 'text/plain']);
        File::factory()->create(['filename' => 'excel.xlsx', 'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);

        $this->get(route('files.index', ['search' => 'audio']))
            ->assertStatus(200)
            ->assertJsonPath('data.0.type', 'audio');

        $this->get(route('files.index', ['search' => 'text']))
            ->assertStatus(200)
            ->assertJsonPath('data.0.type', 'text');

        $this->get(route('files.index', ['search' => 'excel']))
            ->assertStatus(200)
            ->assertJsonPath('data.0.type', 'spreadsheet');
    });
});

describe('FileController upload method', function () {
    it('successfully uploads a file', function () {
        $file = UploadedFile::fake()->image('test.jpg', 100, 100)->size(1024);

        $this->postJson(route('files.upload'), ['file' => $file])
            ->assertStatus(201)
            ->assertJsonStructure(['id', 'filename', 'path', 'formatted_size', 'type'])
            ->assertJsonPath('filename', 'test.jpg')
            ->assertJsonPath('type', 'image');

        $this->assertDatabaseHas('files', [
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg'
        ]);

        $response = $this->postJson(route('files.upload'), ['file' => $file]);
        Storage::disk('public')->assertExists($response->json('path'));
    });

    it('stores file in year/month directory structure', function () {
        $file = UploadedFile::fake()->create('document.pdf', 500);
        $currentYearMonth = date('Y/m');

        $response = $this->postJson(route('files.upload'), ['file' => $file])
            ->assertStatus(201);

        expect($response->json('path'))->toStartWith("shelf/{$currentYearMonth}/");
    });

    it('validates required file parameter', function () {
        $this->postJson(route('files.upload'), [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    });

    it('validates file must be a file', function () {
        $this->postJson(route('files.upload'), ['file' => 'not-a-file'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    });
});

describe('FileController delete method', function () {
    beforeEach(function () {
        $this->file = File::factory()->create(['path' => 'test/file.jpg']);
        Storage::disk('public')->put($this->file->path, 'test content');
    });

    it('successfully deletes a file', function () {
        $this->deleteJson(route('files.delete'), ['id' => $this->file->id])
            ->assertStatus(200)
            ->assertJson(['message' => 'File deleted successfully.']);

        $this->assertDatabaseMissing('files', ['id' => $this->file->id]);
        Storage::disk('public')->assertMissing($this->file->path);
    });

    it('validates required id parameter', function () {
        $this->deleteJson(route('files.delete'), [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id']);
    });

    it('validates file exists in database', function () {
        $this->deleteJson(route('files.delete'), ['id' => 99999])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id']);
    });
});

describe('FileController replace method', function () {
    beforeEach(function () {
        $this->existingFile = File::factory()->create([
            'filename' => 'old-file.txt',
            'path' => 'shelf/2023/01/old-file.txt',
            'mime_type' => 'text/plain',
            'size' => 500
        ]);
        Storage::disk('public')->put($this->existingFile->path, 'old content');
    });

    it('successfully replaces a file', function () {
        $newFile = UploadedFile::fake()->create('new-file.pdf', 1000, 'application/pdf');

        $this->postJson(route('files.replace'), [
            'id' => $this->existingFile->id,
            'file' => $newFile
        ])
            ->assertStatus(200)
            ->assertJson(['message' => 'File replaced successfully.']);

        $this->existingFile->refresh();
        expect($this->existingFile->filename)->toBe('new-file.pdf')
            ->and($this->existingFile->mime_type)->toBe('application/pdf')
            ->and($this->existingFile->size)->toBe(1024000)
            ->and($this->existingFile->path)->toBe('shelf/2023/01/old-file.txt');

        Storage::disk('public')->assertExists($this->existingFile->path);
    });

    it('validates required id parameter', function () {
        $newFile = UploadedFile::fake()->create('new-file.pdf');

        $this->postJson(route('files.replace'), ['file' => $newFile])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id']);
    });

    it('validates required file parameter', function () {
        $this->postJson(route('files.replace'), ['id' => $this->existingFile->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    });

    it('validates file exists in database', function () {
        $newFile = UploadedFile::fake()->create('new-file.pdf');

        $this->postJson(route('files.replace'), [
            'id' => 99999,
            'file' => $newFile
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id']);
    });

    it('validates file must be a file', function () {
        $this->postJson(route('files.replace'), [
            'id' => $this->existingFile->id,
            'file' => 'not-a-file'
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    });
});

describe('FileController integration tests', function () {
    beforeEach(function () {
        File::factory()->create([
            'filename' => 'vacation-photo.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 2097152,
            'created_at' => '2023-06-15'
        ]);

        File::factory()->create([
            'filename' => 'vacation-video.mp4',
            'mime_type' => 'video/mp4',
            'size' => 10485760,
            'created_at' => '2023-06-20'
        ]);

        File::factory()->create([
            'filename' => 'work-document.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1048576,
            'created_at' => '2023-07-10'
        ]);
    });

    it('combines multiple filters correctly', function () {
        $this->get(route('files.index', [
            'type' => 'image',
            'year' => 2023,
            'month' => 6,
            'search' => 'vacation'
        ]))
            ->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.filename', 'vacation-photo.jpg')
            ->assertJsonPath('data.0.type', 'image');
    });

    it('combines search with sorting', function () {
        $response = $this->get(route('files.index', [
            'search' => 'vacation',
            'sort' => 'size'
        ]))
            ->assertStatus(200)
            ->assertJsonPath('total', 2);

        $data = $response->json('data');
        expect($data[0]['formatted_size'])->toBe('2 MB')
            ->and($data[1]['formatted_size'])->toBe('10 MB');
    });

    it('tests pagination with many files', function () {
        File::factory(12)->create();

        $this->get(route('files.index'))
            ->assertStatus(200)
            ->assertJsonPath('total', 15)
            ->assertJsonPath('per_page', 10)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('last_page', 2);
    });
});
