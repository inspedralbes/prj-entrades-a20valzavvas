<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\JsonResponse;

class EventSeatsController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)
            ->where('published', true)
            ->with('priceCategories')
            ->first();

        if (! $event) {
            return response()->json(['message' => 'Event no trobat'], 404);
        }

        $seats = $event->seats()
            ->with('priceCategory')
            ->orderBy('row')
            ->orderBy('number')
            ->get();

        $files = [];
        foreach ($seats as $seat) {
            $files[$seat->row][] = [
                'id' => $seat->id,
                'estat' => $seat->estat,
                'fila' => $seat->row,
                'numero' => $seat->number,
                'id_categoria' => $seat->price_category_id,
                'preu' => (float) $seat->priceCategory->price,
            ];
        }

        $categories = $event->priceCategories->map(fn ($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'price' => (float) $cat->price,
        ])->values();

        return response()->json([
            'event' => [
                'id' => $event->id,
                'nom' => $event->name,
                'slug' => $event->slug,
                'data' => $event->date->toDateTimeString(),
                'recinte' => $event->venue,
            ],
            'categories' => $categories,
            'files' => $files,
        ]);
    }
}
