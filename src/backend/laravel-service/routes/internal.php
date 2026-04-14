<?php

use App\Http\Controllers\ReservationExpiryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Internal Routes
|--------------------------------------------------------------------------
|
| Routes for Docker-internal service-to-service communication.
| These routes are intended to be accessible only within the Docker network.
|
*/

Route::middleware('internal.secret')->group(function () {
    Route::delete('/reservations/expired', [ReservationExpiryController::class, 'destroy']);
});
