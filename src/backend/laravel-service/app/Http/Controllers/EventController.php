<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::where('published', true)
            ->orderBy('date')
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'date' => $event->date->toDateTimeString(),
                'venue' => $event->venue,
            ]);

        return response()->json($events);
    }
}
