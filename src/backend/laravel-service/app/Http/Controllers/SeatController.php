<?php

namespace App\Http\Controllers;

use App\Models\Seat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeatController extends Controller
{
    public function indexByIds(Request $request): JsonResponse
    {
        $ids = $request->query('ids', []);

        if (empty($ids)) {
            return response()->json([]);
        }

        $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
        $validIds = array_filter((array) $ids, fn (string $id) => preg_match($uuidPattern, $id));

        if (empty($validIds)) {
            return response()->json([]);
        }

        $seats = Seat::with('priceCategory')
            ->whereIn('id', $validIds)
            ->get()
            ->map(fn (Seat $seat) => [
                'id' => $seat->id,
                'fila' => $seat->row,
                'numero' => $seat->number,
                'categoria' => $seat->priceCategory?->name,
                'preu' => (float) $seat->priceCategory?->price,
            ]);

        return response()->json($seats);
    }
}
