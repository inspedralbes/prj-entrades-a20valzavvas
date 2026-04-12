<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::where('published', true)
            ->withCount(['seats as available_seats' => fn ($q) => $q->where('estat', 'DISPONIBLE')])
            ->orderBy('date')
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'date' => $event->date->toDateTimeString(),
                'venue' => $event->venue,
                'description' => $event->description,
                'image_url' => $event->image_url,
                'available_seats' => $event->available_seats,
            ]);

        return response()->json($events);
    }
}
