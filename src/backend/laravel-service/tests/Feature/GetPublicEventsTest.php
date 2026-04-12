<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Seat;
use Tests\TestCase;

class GetPublicEventsTest extends TestCase
{
    public function test_returns_200_without_authentication(): void
    {
        $response = $this->getJson('/api/events');

        $response->assertStatus(200);
    }

    public function test_returns_only_published_events(): void
    {
        Event::factory()->count(2)->create(['published' => true]);
        Event::factory()->draft()->create();

        $response = $this->getJson('/api/events');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_response_includes_new_fields(): void
    {
        Event::factory()->create(['published' => true]);

        $response = $this->getJson('/api/events');

        $response->assertStatus(200);
        $event = $response->json(0);
        $this->assertArrayHasKey('description', $event);
        $this->assertArrayHasKey('image_url', $event);
        $this->assertArrayHasKey('available_seats', $event);
    }

    public function test_available_seats_counts_only_disponible_seats(): void
    {
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create(['event_id' => $event->id]);

        Seat::factory()->count(6)->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => 'DISPONIBLE',
        ]);
        Seat::factory()->count(3)->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => 'RESERVAT',
        ]);
        Seat::factory()->count(1)->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => 'VENUT',
        ]);

        $response = $this->getJson('/api/events');

        $response->assertStatus(200);
        $this->assertEquals(6, $response->json(0)['available_seats']);
    }

    public function test_event_with_no_seats_has_zero_available_seats(): void
    {
        Event::factory()->create(['published' => true]);

        $response = $this->getJson('/api/events');

        $response->assertStatus(200);
        $this->assertEquals(0, $response->json(0)['available_seats']);
    }
}
