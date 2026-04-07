<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;

class AdminEventController extends Controller
{
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
}
