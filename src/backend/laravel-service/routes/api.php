<?php

use App\Http\Controllers\Admin\AdminEventController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventSeatsController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\SeatReservationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}/seats', [EventSeatsController::class, 'show']);

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/seats', [SeatController::class, 'indexByIds']);
    Route::post('/seats/{seatId}/reserve', [SeatReservationController::class, 'store']);
    Route::delete('/seats/{seatId}/reserve', [SeatReservationController::class, 'destroy']);
    Route::post('/orders', [OrderController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/events', [AdminEventController::class, 'index']);
    Route::post('/events', [AdminEventController::class, 'store']);
    Route::get('/events/{id}', [AdminEventController::class, 'show']);
    Route::put('/events/{id}', [AdminEventController::class, 'update']);
    Route::delete('/events/{id}', [AdminEventController::class, 'destroy']);
});
