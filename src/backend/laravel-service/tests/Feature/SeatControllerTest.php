<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Seat;
use App\Models\User;
use Tests\TestCase;

class SeatControllerTest extends TestCase
{
    private function createSeatWithCategory(array $seatOverrides = []): array
    {
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create([
            'event_id' => $event->id,
            'name' => 'Platea',
            'price' => 25.00,
        ]);
        $seat = Seat::factory()->create(array_merge([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'A',
            'number' => 1,
            'estat' => 'DISPONIBLE',
        ], $seatOverrides));

        return [$seat, $category];
    }

    public function test_returns_seat_details_for_valid_ids(): void
    {
        $user = User::factory()->create(['role' => 'comprador']);
        [$seat, $category] = $this->createSeatWithCategory(['row' => 'B', 'number' => 5]);

        $response = $this->actingAs($user)->getJson("/api/seats?ids[]={$seat->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'id' => $seat->id,
                'fila' => 'B',
                'numero' => 5,
                'categoria' => 'Platea',
                'preu' => 25.0,
            ]);
    }

    public function test_returns_multiple_seats(): void
    {
        $user = User::factory()->create(['role' => 'comprador']);
        [$seat1] = $this->createSeatWithCategory(['row' => 'A', 'number' => 1]);
        [$seat2] = $this->createSeatWithCategory(['row' => 'A', 'number' => 2]);

        $response = $this->actingAs($user)->getJson("/api/seats?ids[]={$seat1->id}&ids[]={$seat2->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_returns_empty_array_for_nonexistent_ids(): void
    {
        $user = User::factory()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->getJson('/api/seats?ids[]=nonexistent-uuid');

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_returns_empty_array_when_no_ids_provided(): void
    {
        $user = User::factory()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->getJson('/api/seats');

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_returns_401_without_authentication(): void
    {
        $response = $this->getJson('/api/seats?ids[]=some-id');

        $response->assertStatus(401);
    }
}
