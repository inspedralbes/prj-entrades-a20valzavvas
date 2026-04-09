<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\PriceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PriceCategory>
 */
class PriceCategoryFactory extends Factory
{
    protected $model = PriceCategory::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->randomElement(['General', 'VIP', 'Preferent']),
            'price' => fake()->randomFloat(2, 5, 50),
        ];
    }
}
