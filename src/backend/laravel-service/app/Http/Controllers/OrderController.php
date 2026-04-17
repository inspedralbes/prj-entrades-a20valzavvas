<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();

        $activeReservations = Reservation::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->get();

        $seatIds = $request->input('seat_ids');
        if (! empty($seatIds)) {
            $activeIds = $activeReservations->pluck('seat_id')->all();
            $expiredIds = array_values(array_diff($seatIds, $activeIds));
            if (! empty($expiredIds)) {
                return response()->json(['seients_expirats' => $expiredIds], 409);
            }
        }

        if ($activeReservations->isEmpty()) {
            return response()->json(['error' => 'No tens reserves actives.'], 409);
        }

        try {
            $result = DB::transaction(function () use ($user, $activeReservations) {
                $seatIds = $activeReservations->pluck('seat_id');

                $seats = Seat::with('priceCategory')
                    ->lockForUpdate()
                    ->whereIn('id', $seatIds)
                    ->get();

                $totalAmount = $seats->sum(fn (Seat $seat) => (float) $seat->priceCategory?->price);

                $order = Order::create([
                    'user_id' => $user->id,
                    'total_amount' => $totalAmount,
                    'status' => 'completed',
                ]);

                $items = [];
                foreach ($seats as $seat) {
                    $price = (float) $seat->priceCategory?->price;
                    OrderItem::create([
                        'order_id' => $order->id,
                        'seat_id' => $seat->id,
                        'price' => $price,
                    ]);
                    $items[] = ['seat_id' => $seat->id, 'preu' => $price];
                }

                Seat::whereIn('id', $seatIds)->update(['estat' => 'VENUT']);
                Reservation::whereIn('seat_id', $seatIds)
                    ->where('user_id', $user->id)
                    ->delete();

                return [
                    'id' => $order->id,
                    'total_amount' => number_format($totalAmount, 2, '.', ''),
                    'items' => $items,
                ];
            });

            return response()->json($result, 201);

        } catch (Throwable) {
            return response()->json(['error' => 'Error intern del servidor.'], 500);
        }
    }
}
