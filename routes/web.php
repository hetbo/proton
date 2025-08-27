<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

require __DIR__ . '/files.php';

Route::get('/', function () {
    return view('welcome');
});

/** Quick Login --dev **/
Route::get('/login/{id}', function ($id) {
    Auth::loginUsingId($id);
    return ['message' => 'you\'re logged in'];
})->middleware('guest');

Route::get('/logout', function () {
    Auth::logout();
    return ['message' => 'you are logged out'];
})->middleware('auth');

Route::get('/login', function () {
    return ['message' => 'use quick login'];
})->name('login');
