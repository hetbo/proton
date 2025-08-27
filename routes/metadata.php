<?php

use App\Http\Controllers\MetadataController;
use App\Http\Middleware\AdminMW;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::middleware(AdminMW::class)
    ->prefix('meta')
    ->name('meta.')
    ->controller(MetadataController::class)
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->group(function () {

        Route::post('/add', 'add')->name('add');
        Route::patch('/update', 'update')->name('update');
        Route::delete('/delete', 'delete')->name('delete');

    });
