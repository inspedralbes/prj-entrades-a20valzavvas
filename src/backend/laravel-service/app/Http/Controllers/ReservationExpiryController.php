<?php

namespace App\Http\Controllers;

use App\Services\SeatExpiryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationExpiryController extends Controller
{
    public function __construct(private readonly SeatExpiryService $seatExpiryService) {}

    public function destroy(Request $request): JsonResponse
    {
        $released = $this->seatExpiryService->releaseExpired();

        return response()->json(['released' => $released]);
    }
}
