<?php

namespace App\Http\Controllers;

use App\Services\AdminEventService;
use Illuminate\Http\JsonResponse;

class EventStatsController extends Controller
{
    public function __construct(private readonly AdminEventService $adminEventService) {}

    public function show(string $id): JsonResponse
    {
        try {
            $stats = $this->adminEventService->getEventStats($id);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'not_found') {
                return response()->json(['message' => 'Event not found'], 404);
            }
            throw $e;
        }

        return response()->json($stats);
    }
}
