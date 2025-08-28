<?php

use App\Http\Controllers\FileableController;
use App\Http\Middleware\AdminMW;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::middleware(AdminMW::class)
    ->prefix('fileables')
    ->name('fileables.')
    ->controller(FileableController::class)
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->group(function () {

        Route::get('/', 'index')->name('index');
        Route::post('/attach', 'attach')->name('attach');
        Route::delete('/detach', 'detach')->name('detach');

    });
