<?php

namespace App\Services;

use App\Models\Event;
use App\Models\OrderItem;
use App\Models\PriceCategory;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminEventService
{
    public function show(string $id): Event
    {
        $event = Event::with(['priceCategories' => fn ($q) => $q->withCount('seats')])->find($id);

        if (! $event) {
            throw new \RuntimeException('not_found');
        }

        return $event;
    }

    /**
     * @throws \RuntimeException 'not_found' | 'has_active_reservations' | 'duplicate_slug'
     */
    public function update(string $id, array $data): Event
    {
        $event = Event::find($id);

        if (! $event) {
            throw new \RuntimeException('not_found');
        }

        if (array_key_exists('price_categories', $data)) {
            $hasActiveReservations = Reservation::whereHas(
                'seat',
                fn ($q) => $q->where('event_id', $event->id)
            )->where('expires_at', '>', now())->exists();

            $hasOrderItems = OrderItem::whereHas(
                'seat',
                fn ($q) => $q->where('event_id', $event->id)
            )->exists();

            if ($hasActiveReservations || $hasOrderItems) {
                throw new \RuntimeException('has_active_reservations');
            }
        }

        $newSlug = $data['slug'] ?? null;
        if ($newSlug && $newSlug !== $event->slug) {
            if (Event::where('slug', $newSlug)->where('id', '!=', $event->id)->exists()) {
                throw new \RuntimeException('duplicate_slug');
            }
        }

        $fillable = array_intersect_key($data, array_flip(['name', 'slug', 'description', 'date', 'venue']));
        $event->update($fillable);

        return $event->fresh(['priceCategories' => fn ($q) => $q->withCount('seats')]);
    }

    /**
     * @throws \RuntimeException if slug already exists
     */
    public function store(array $data): Event
    {
        $slug = $this->resolveSlug($data);

        if (Event::where('slug', $slug)->exists()) {
            throw new \RuntimeException('duplicate_slug');
        }

        return DB::transaction(function () use ($data, $slug) {
            $totalCapacity = array_sum(array_map(
                fn ($cat) => count($cat['rows']) * $cat['seats_per_row'],
                $data['price_categories']
            ));

            $event = Event::create([
                'name' => $data['name'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'date' => $data['date'],
                'venue' => $data['venue'],
                'total_capacity' => $totalCapacity,
                'published' => false,
            ]);

            $now = now();

            foreach ($data['price_categories'] as $catData) {
                $category = PriceCategory::create([
                    'event_id' => $event->id,
                    'name' => $catData['name'],
                    'price' => $catData['price'],
                ]);

                $seats = [];
                foreach ($catData['rows'] as $row) {
                    for ($number = 1; $number <= $catData['seats_per_row']; $number++) {
                        $seats[] = [
                            'id' => (string) Str::uuid(),
                            'event_id' => $event->id,
                            'price_category_id' => $category->id,
                            'row' => $row,
                            'number' => $number,
                            'estat' => 'DISPONIBLE',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }

                DB::table('seats')->insert($seats);
            }

            return $event->load(['priceCategories' => fn ($q) => $q->withCount('seats')]);
        });
    }

    private function resolveSlug(array $data): string
    {
        if (! empty($data['slug'])) {
            return $data['slug'];
        }

        return Str::slug($data['name']);
    }
}
