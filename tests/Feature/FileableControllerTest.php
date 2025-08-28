<?php

use App\Models\File;
use App\Models\Post;
use App\Models\User;
use App\Models\Metadata;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware();
});

describe('FileableController', function () {
    beforeEach(function () {
        $this->post = Post::factory()->create();
        $this->user = User::factory()->create();
        $this->file = File::factory()->create();
    });

    describe('index method', function () {
        it('returns files for valid model without role filter', function () {
            $this->post->attachFile($this->file, 'avatar');

            $this->getJson(route('fileables.index', [
                'type' => 'post',
                'id' => $this->post->id,
            ]))
                ->assertStatus(200)
                ->assertJsonStructure(['success', 'data'])
                ->assertJsonPath('success', true)
                ->assertJsonCount(1, 'data');
        });

        it('returns files filtered by role', function () {
            $file2 = File::factory()->create();
            $this->post->attachFile($this->file, 'avatar');
            $this->post->attachFile($file2, 'banner');

            $this->getJson(route('fileables.index', [
                'type' => 'post',
                'id' => $this->post->id,
                'role' => 'avatar',
            ]))
                ->assertStatus(200)
                ->assertJsonPath('success', true)
                ->assertJsonCount(1, 'data');
        });

        it('validates required type field', function () {
            $this->getJson(route('fileables.index'), [
                'id' => $this->post->id,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['type']);
        });

        it('validates required id field', function () {
            $this->getJson(route('fileables.index'), [
                'type' => 'post',
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['id']);
        });

        it('validates id must be integer', function () {
            $this->getJson(route('fileables.index'), [
                'type' => 'post',
                'id' => 'not-integer',
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['id']);
        });

        it('returns error for invalid model type', function () {
            $this->getJson(route('fileables.index'), [
                'type' => 'invalid',
                'id' => 1,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['type']);
        });

        it('returns error for non-existent model id', function () {
            $this->getJson(route('fileables.index'), [
                'type' => 'post',
                'id' => 99999,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['id']);
        });

        it('returns error for model without HasFiles trait', function () {
            $this->getJson(route('fileables.index'), [
                'type' => 'migration',
                'id' => 1,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['type']);
        });
    });

    describe('attach method', function () {
        it('successfully attaches file to model', function () {
            $this->postJson(route('fileables.attach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'file_id' => $this->file->id,
                'role' => 'avatar',
            ])
                ->assertStatus(201)
                ->assertJsonStructure(['success', 'message', 'data'])
                ->assertJsonPath('success', true)
                ->assertJsonPath('message', 'File attached successfully.')
                ->assertJsonPath('data.file_id', $this->file->id)
                ->assertJsonPath('data.fileable_type', 'post')
                ->assertJsonPath('data.fileable_id', $this->post->id)
                ->assertJsonPath('data.role', 'avatar');

            expect($this->post->hasFile($this->file, 'avatar'))->toBeTrue();
        });

        it('validates required type field', function () {
            $this->postJson(route('fileables.attach'), [
                'id' => $this->post->id,
                'file_id' => $this->file->id,
                'role' => 'avatar',
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['type']);
        });

        it('validates required id field', function () {
            $this->postJson(route('fileables.attach'), [
                'type' => 'post',
                'file_id' => $this->file->id,
                'role' => 'avatar',
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['id']);
        });

        it('validates required file_id field', function () {
            $this->postJson(route('fileables.attach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'role' => 'avatar',
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['file_id']);
        });

        it('validates required role field', function () {
            $this->postJson(route('fileables.attach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'file_id' => $this->file->id,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['role']);
        });

        it('validates file_id exists in files table', function () {
            $this->postJson(route('fileables.attach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'file_id' => 99999,
                'role' => 'avatar',
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['file_id']);
        });

        it('returns error for invalid model type', function () {
            $this->postJson(route('fileables.attach'), [
                'type' => 'invalid',
                'id' => 1,
                'file_id' => $this->file->id,
                'role' => 'avatar',
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['type']);
        });

        it('returns conflict when attaching duplicate file with same role', function () {
            $this->post->attachFile($this->file, 'avatar');

            $this->postJson(route('fileables.attach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'file_id' => $this->file->id,
                'role' => 'avatar',
            ])
                ->assertStatus(409)
                ->assertJsonPath('success', false)
                ->assertJsonPath('message', 'This file is already attached with the same role.');
        });
    });

    describe('detach method', function () {
        beforeEach(function () {
            $this->post->attachFile($this->file, 'avatar');
        });

        it('successfully detaches file with role', function () {
            $this->deleteJson(route('fileables.detach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'file_id' => $this->file->id,
                'role' => 'avatar',
            ])
                ->assertStatus(200)
                ->assertJsonPath('success', true)
                ->assertJsonPath('message', 'File detached successfully.')
                ->assertJsonPath('data.file_id', $this->file->id)
                ->assertJsonPath('data.fileable_type', 'post')
                ->assertJsonPath('data.fileable_id', $this->post->id)
                ->assertJsonPath('data.role', 'avatar');

            expect($this->post->hasFile($this->file, 'avatar'))->toBeFalse();
        });

        it('successfully detaches file without role', function () {
            $this->deleteJson(route('fileables.detach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'file_id' => $this->file->id,
            ])
                ->assertStatus(200)
                ->assertJsonPath('success', true)
                ->assertJsonPath('message', 'File detached successfully.');
        });

        it('validates required type field', function () {
            $this->deleteJson(route('fileables.detach'), [
                'id' => $this->post->id,
                'file_id' => $this->file->id,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['type']);
        });

        it('validates required id field', function () {
            $this->deleteJson(route('fileables.detach'), [
                'type' => 'post',
                'file_id' => $this->file->id,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['id']);
        });

        it('validates required file_id field', function () {
            $this->deleteJson(route('fileables.detach'), [
                'type' => 'post',
                'id' => $this->post->id,
            ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['file_id']);
        });

        it('returns error when file is not attached', function () {
            $newFile = File::factory()->create();

            $this->deleteJson(route('fileables.detach'), [
                'type' => 'post',
                'id' => $this->post->id,
                'file_id' => $newFile->id,
                'role' => 'avatar',
            ])
                ->assertStatus(404)
                ->assertJsonPath('success', false)
                ->assertJsonPath('message', 'File was not attached or already detached.');
        });
    });
});
