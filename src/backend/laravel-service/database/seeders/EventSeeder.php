<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Seat;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $event = Event::updateOrCreate(
            ['slug' => 'dune-4k-dolby-2026'],
            [
                'name' => 'Dune: Projecció Especial 4K Dolby Atmos',
                'description' => 'Projecció especial de Dune en format 4K amb so Dolby Atmos a la Sala Onirica.',
                'date' => '2026-06-15 21:00:00',
                'venue' => 'Sala Onirica',
                'total_capacity' => 200,
            ]
        );

        $vip = PriceCategory::updateOrCreate(
            ['event_id' => $event->id, 'name' => 'VIP'],
            ['price' => 50.00]
        );

        $general = PriceCategory::updateOrCreate(
            ['event_id' => $event->id, 'name' => 'General'],
            ['price' => 25.00]
        );

        // Files A-B → VIP, files C-J → General
        $categoryByRow = [];
        foreach (range('A', 'B') as $row) {
            $categoryByRow[$row] = $vip->id;
        }
        foreach (range('C', 'J') as $row) {
            $categoryByRow[$row] = $general->id;
        }

        foreach ($categoryByRow as $row => $categoryId) {
            for ($number = 1; $number <= 20; $number++) {
                Seat::updateOrCreate(
                    [
                        'event_id' => $event->id,
                        'row' => $row,
                        'number' => $number,
                    ],
                    [
                        'price_category_id' => $categoryId,
                        'estat' => 'DISPONIBLE',
                    ]
                );
            }
        }
    }
}
