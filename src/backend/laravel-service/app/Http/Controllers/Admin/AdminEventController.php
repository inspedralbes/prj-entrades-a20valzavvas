<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Models\Event;
use App\Services\AdminEventService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;

class AdminEventController extends Controller
{
    public function __construct(private AdminEventService $eventService) {}

    public function index(): JsonResponse
    {
        $events = Event::withCount([
            'seats as seients_disponibles' => fn ($q) => $q->where('estat', 'DISPONIBLE'),
            'seats as seients_reservats' => fn ($q) => $q->where('estat', 'RESERVAT'),
            'seats as seients_venuts' => fn ($q) => $q->where('estat', 'VENUT'),
        ])
            ->orderBy('date')
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'nom' => $event->name,
                'data' => $event->date->toDateString(),
                'hora' => $event->date->toTimeString('minute'),
                'recinte' => $event->venue,
                'publicat' => $event->published,
                'seients_disponibles' => $event->seients_disponibles,
                'seients_reservats' => $event->seients_reservats,
                'seients_venuts' => $event->seients_venuts,
            ]);

        return response()->json($events);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        try {
            $event = $this->eventService->store($request->validated());
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'duplicate_slug'
                || $e instanceof UniqueConstraintViolationException) {
                return response()->json(['message' => 'Slug already exists'], 409);
            }
            throw $e;
        }

        return response()->json([
            'id' => $event->id,
            'name' => $event->name,
            'slug' => $event->slug,
            'date' => $event->date->toDateString(),
            'time' => $event->date->toTimeString('minute'),
            'venue' => $event->venue,
            'published' => $event->published,
            'total_capacity' => $event->total_capacity,
            'price_categories' => $event->priceCategories->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'price' => $cat->price,
                'seats_count' => $cat->seats_count,
            ]),
        ], 201);
    }
}
