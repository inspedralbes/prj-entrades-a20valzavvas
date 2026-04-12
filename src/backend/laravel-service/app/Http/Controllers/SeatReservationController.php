<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class SeatReservationController extends Controller
{
    public function store(Request $request, string $seatId): JsonResponse
    {
        $user = $request->user();

        try {
            $result = DB::transaction(function () use ($seatId, $user) {
                /** @var Seat $seat */
                $seat = Seat::lockForUpdate()->find($seatId);

                if (! $seat) {
                    return ['ok' => false, 'status' => 404, 'motiu' => 'seient_no_trobat'];
                }

                if ($seat->estat !== 'DISPONIBLE') {
                    return ['ok' => false, 'status' => 409, 'motiu' => 'no_disponible'];
                }

                $expiresAt = now()->addMinutes(5);

                $reservation = Reservation::create([
                    'seat_id' => $seat->id,
                    'user_id' => $user->id,
                    'expires_at' => $expiresAt,
                ]);

                $seat->update(['estat' => 'RESERVAT']);

                return [
                    'ok' => true,
                    'reservation' => [
                        'id' => $reservation->id,
                        'expires_at' => $expiresAt->toISOString(),
                    ],
                    'seat' => [
                        'id' => $seat->id,
                        'fila' => $seat->row,
                        'numero' => $seat->number,
                        'estat' => 'RESERVAT',
                    ],
                ];
            });

            if (! $result['ok']) {
                return response()->json(['motiu' => $result['motiu']], $result['status']);
            }

            return response()->json([
                'reservation' => $result['reservation'],
                'seat' => $result['seat'],
            ], 200);

        } catch (Throwable) {
            return response()->json(['motiu' => 'error_intern'], 500);
        }
    }
}
