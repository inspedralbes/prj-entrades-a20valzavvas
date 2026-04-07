<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
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

    public function show(string $id): JsonResponse
    {
        try {
            $event = $this->eventService->show($id);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'not_found') {
                return response()->json(['message' => 'Event not found'], 404);
            }
            throw $e;
        }

        return response()->json($this->formatEvent($event));
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

    public function update(UpdateEventRequest $request, string $id): JsonResponse
    {
        try {
            $event = $this->eventService->update($id, $request->validated());
        } catch (\RuntimeException $e) {
            return match ($e->getMessage()) {
                'not_found' => response()->json(['message' => 'Event not found'], 404),
                'has_active_reservations' => response()->json([
                    'message' => "No és possible modificar les categories mentre hi ha reserves actives",
                ], 422),
                'duplicate_slug' => response()->json(['message' => 'Slug already exists'], 409),
                default => throw $e,
            };
        }

        return response()->json($this->formatEvent($event));
    }

    private function formatEvent(Event $event): array
    {
        return [
            'id' => $event->id,
            'name' => $event->name,
            'slug' => $event->slug,
            'description' => $event->description,
            'date' => $event->date->toDateTimeString(),
            'venue' => $event->venue,
            'published' => $event->published,
            'total_capacity' => $event->total_capacity,
            'price_categories' => $event->priceCategories->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'price' => $cat->price,
                'seats_count' => $cat->seats_count ?? 0,
            ]),
        ];
    }
}

