<?php

use App\Http\Controllers\FileController;
use App\Http\Middleware\AdminMW;
use Illuminate\Support\Facades\Route;

Route::middleware(AdminMW::class)
    ->prefix('files')
    ->name('files.')
    ->controller(FileController::class)
    ->group(function () {

        Route::get('/', 'index')->name('index');

});
