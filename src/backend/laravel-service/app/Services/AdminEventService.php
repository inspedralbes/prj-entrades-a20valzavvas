<?php

namespace App\Services;

use App\Models\Event;
use App\Models\PriceCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminEventService
{
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
                'name'           => $data['name'],
                'slug'           => $slug,
                'description'    => $data['description'] ?? null,
                'date'           => $data['date'],
                'venue'          => $data['venue'],
                'total_capacity' => $totalCapacity,
                'published'      => false,
            ]);

            $now = now();

            foreach ($data['price_categories'] as $catData) {
                $category = PriceCategory::create([
                    'event_id' => $event->id,
                    'name'     => $catData['name'],
                    'price'    => $catData['price'],
                ]);

                $seats = [];
                foreach ($catData['rows'] as $row) {
                    for ($number = 1; $number <= $catData['seats_per_row']; $number++) {
                        $seats[] = [
                            'id'                => (string) Str::uuid(),
                            'event_id'          => $event->id,
                            'price_category_id' => $category->id,
                            'row'               => $row,
                            'number'            => $number,
                            'estat'             => 'DISPONIBLE',
                            'created_at'        => $now,
                            'updated_at'        => $now,
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
