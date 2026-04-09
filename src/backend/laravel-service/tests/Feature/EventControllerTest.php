<?php

namespace Tests\Feature;

use App\Models\Event;
use Tests\TestCase;

class EventControllerTest extends TestCase
{
    public function test_index_returns_only_published_events(): void
    {
        Event::factory()->count(2)->create(['published' => true]);
        Event::factory()->draft()->create();

        $response = $this->getJson('/api/events');

        $response->assertStatus(200)
            ->assertJsonCount(2);

        foreach ($response->json() as $event) {
            $this->assertArrayHasKey('id', $event);
            $this->assertArrayHasKey('name', $event);
            $this->assertArrayHasKey('slug', $event);
            $this->assertArrayHasKey('date', $event);
            $this->assertArrayHasKey('venue', $event);
        }
    }

    public function test_index_returns_empty_array_when_no_published_events(): void
    {
        Event::factory()->count(3)->draft()->create();

        $response = $this->getJson('/api/events');

        $response->assertStatus(200)
            ->assertJsonCount(0)
            ->assertJson([]);
    }

    public function test_index_returns_events_ordered_by_date_ascending(): void
    {
        $later = Event::factory()->create([
            'published' => true,
            'date' => now()->addDays(10),
        ]);
        $sooner = Event::factory()->create([
            'published' => true,
            'date' => now()->addDays(2),
        ]);

        $response = $this->getJson('/api/events');

        $response->assertStatus(200);
        $ids = array_column($response->json(), 'id');
        $this->assertEquals([$sooner->id, $later->id], $ids);
    }

    public function test_index_does_not_require_authentication(): void
    {
        $response = $this->getJson('/api/events');

        $response->assertStatus(200);
    }
}
