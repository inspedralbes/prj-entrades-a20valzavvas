<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Seat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Seat>
 */
class SeatFactory extends Factory
{
    protected $model = Seat::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'price_category_id' => PriceCategory::factory(),
            'row' => fake()->randomElement(['A', 'B', 'C', 'D', 'E']),
            'number' => fake()->numberBetween(1, 20),
            'estat' => 'DISPONIBLE',
        ];
    }

    public function reservat(): static
    {
        return $this->state(['estat' => 'RESERVAT']);
    }

    public function venut(): static
    {
        return $this->state(['estat' => 'VENUT']);
    }
}
