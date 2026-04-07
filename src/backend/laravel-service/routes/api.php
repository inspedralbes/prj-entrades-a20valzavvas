<?php

use App\Http\Controllers\Admin\AdminEventController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/events', [AdminEventController::class, 'index']);
    Route::post('/events', [AdminEventController::class, 'store']);
    Route::get('/events/{id}', [AdminEventController::class, 'show']);
    Route::put('/events/{id}', [AdminEventController::class, 'update']);
});
