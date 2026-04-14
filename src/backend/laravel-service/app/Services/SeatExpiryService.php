<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Support\Facades\DB;

class SeatExpiryService
{
    /**
     * Release all reservations whose expires_at is in the past.
     *
     * Runs inside a single atomic transaction with pessimistic locking.
     *
     * @return array<int, array{seatId: string, eventId: string}>
     */
    public function releaseExpired(): array
    {
        return DB::transaction(function () {
            $reservations = Reservation::query()
                ->join('seats', 'seats.id', '=', 'reservations.seat_id')
                ->where('reservations.expires_at', '<', now())
                ->lockForUpdate()
                ->select('reservations.id', 'reservations.seat_id', 'seats.event_id')
                ->get();

            if ($reservations->isEmpty()) {
                return [];
            }

            $seatIds = $reservations->pluck('seat_id')->all();
            $reservationIds = $reservations->pluck('id')->all();

            Seat::whereIn('id', $seatIds)->update(['estat' => 'DISPONIBLE']);
            Reservation::whereIn('id', $reservationIds)->delete();

            return $reservations->map(fn($r) => [
                'seatId'  => $r->seat_id,
                'eventId' => $r->event_id,
            ])->values()->all();
        });
    }
}
