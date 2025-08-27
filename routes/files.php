<?php

use App\Http\Controllers\FileController;
use App\Http\Middleware\AdminMW;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::middleware(AdminMW::class)
    ->prefix('files')
    ->name('files.')
    ->controller(FileController::class)
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->group(function () {

        Route::get('/', 'index')->name('index');
        Route::post('/upload', 'upload')->name('upload');
        Route::post('/replace', 'replace')->name('replace');
        Route::delete('/delete', 'delete')->name('delete');

});
