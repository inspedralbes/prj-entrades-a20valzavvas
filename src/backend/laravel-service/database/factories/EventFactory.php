<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'slug' => fake()->unique()->slug(3),
            'description' => fake()->paragraph(),
            'image_url' => fake()->imageUrl(640, 480, 'cinema'),
            'date' => fake()->dateTimeBetween('now', '+1 year'),
            'venue' => fake()->company(),
            'total_capacity' => fake()->numberBetween(50, 500),
            'published' => true,
        ];
    }

    public function draft(): static
    {
        return $this->state(['published' => false]);
    }
}
