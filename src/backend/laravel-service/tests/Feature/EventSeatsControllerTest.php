<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Seat;
use Tests\TestCase;

class EventSeatsControllerTest extends TestCase
{
    public function test_returns_seats_grouped_by_row(): void
    {
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create(['event_id' => $event->id, 'price' => 12.50]);

        Seat::factory()->create(['event_id' => $event->id, 'price_category_id' => $category->id, 'row' => 'A', 'number' => 1]);
        Seat::factory()->create(['event_id' => $event->id, 'price_category_id' => $category->id, 'row' => 'A', 'number' => 2]);
        Seat::factory()->create(['event_id' => $event->id, 'price_category_id' => $category->id, 'row' => 'B', 'number' => 1]);

        $response = $this->getJson('/api/events/'.$event->slug.'/seats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'event' => ['id', 'nom', 'slug', 'data', 'recinte'],
                'categories',
                'files',
            ]);

        $files = $response->json('files');
        $this->assertArrayHasKey('A', $files);
        $this->assertArrayHasKey('B', $files);
        $this->assertCount(2, $files['A']);
        $this->assertCount(1, $files['B']);
        $this->assertCount(3, collect($files)->flatten(1)->all());
    }

    public function test_seat_fields_are_correct(): void
    {
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create(['event_id' => $event->id, 'price' => 15.00]);
        Seat::factory()->create(['event_id' => $event->id, 'price_category_id' => $category->id, 'row' => 'A', 'number' => 1, 'estat' => 'DISPONIBLE']);

        $response = $this->getJson('/api/events/'.$event->slug.'/seats');

        $response->assertStatus(200);
        $seat = $response->json('files.A.0');
        $this->assertArrayHasKey('id', $seat);
        $this->assertEquals('DISPONIBLE', $seat['estat']);
        $this->assertEquals('A', $seat['fila']);
        $this->assertEquals(1, $seat['numero']);
        $this->assertEquals($category->id, $seat['id_categoria']);
        $this->assertEquals(15.0, $seat['preu']);
    }

    public function test_returns_404_for_nonexistent_slug(): void
    {
        $response = $this->getJson('/api/events/no-existeix/seats');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Event no trobat']);
    }

    public function test_returns_404_for_draft_event(): void
    {
        $event = Event::factory()->draft()->create();
        PriceCategory::factory()->create(['event_id' => $event->id]);

        $response = $this->getJson('/api/events/'.$event->slug.'/seats');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Event no trobat']);
    }

    public function test_does_not_require_authentication(): void
    {
        $event = Event::factory()->create(['published' => true]);
        PriceCategory::factory()->create(['event_id' => $event->id]);

        $response = $this->getJson('/api/events/'.$event->slug.'/seats');

        $response->assertStatus(200);
    }

    public function test_seats_ordered_by_row_then_number(): void
    {
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create(['event_id' => $event->id]);

        Seat::factory()->create(['event_id' => $event->id, 'price_category_id' => $category->id, 'row' => 'B', 'number' => 1]);
        Seat::factory()->create(['event_id' => $event->id, 'price_category_id' => $category->id, 'row' => 'A', 'number' => 3]);
        Seat::factory()->create(['event_id' => $event->id, 'price_category_id' => $category->id, 'row' => 'A', 'number' => 1]);

        $response = $this->getJson('/api/events/'.$event->slug.'/seats');

        $response->assertStatus(200);
        $files = $response->json('files');
        $rowKeys = array_keys($files);
        $this->assertEquals(['A', 'B'], $rowKeys);
        $this->assertEquals(1, $files['A'][0]['numero']);
        $this->assertEquals(3, $files['A'][1]['numero']);
    }
}
