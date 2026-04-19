<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with([
            'orderItems.seat.event',
            'orderItems.seat.priceCategory',
        ])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders->map(fn (Order $order) => [
            'id' => $order->id,
            'total_amount' => $order->total_amount,
            'status' => $order->status,
            'created_at' => $order->created_at,
            'items' => $order->orderItems->map(fn (OrderItem $item) => [
                'id' => $item->id,
                'price' => $item->price,
                'seat' => [
                    'id' => $item->seat->id,
                    'row' => $item->seat->row,
                    'number' => $item->seat->number,
                    'price_category' => $item->seat->priceCategory
                        ? ['name' => $item->seat->priceCategory->name]
                        : null,
                    'event' => $item->seat->event ? [
                        'id' => $item->seat->event->id,
                        'name' => $item->seat->event->name,
                        'slug' => $item->seat->event->slug,
                        'date' => $item->seat->event->date,
                        'venue' => $item->seat->event->venue,
                        'image_url' => $item->seat->event->image_url,
                    ] : null,
                ],
            ]),
        ]));
    }

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

        $createdOrder = null;

        try {
            $result = DB::transaction(function () use ($user, $activeReservations, &$createdOrder) {
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

                $createdOrder = $order;

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
        } catch (Throwable) {
            return response()->json(['error' => 'Error intern del servidor.'], 500);
        }

        // Send confirmation email after the transaction — a mail failure must not affect the response
        try {
            $createdOrder->load(['user', 'orderItems.seat.event', 'orderItems.seat.priceCategory']);
            Mail::to($user->email)->send(new OrderConfirmationMail($createdOrder));
        } catch (Throwable) {
            // Mail failure is non-fatal; order is already persisted
        }

        return response()->json($result, 201);
    }
}
