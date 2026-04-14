<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Reservation;
use App\Models\Seat;
use App\Models\User;
use Tests\TestCase;

class ReservationExpiryControllerTest extends TestCase
{
    private string $internalSecret = 'test-internal-secret';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.internal_secret' => $this->internalSecret]);
    }

    private function createEventWithSeat(string $estat = 'RESERVAT'): array
    {
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create(['event_id' => $event->id]);
        $seat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => $estat,
        ]);
        return [$event, $seat];
    }

    public function test_returns_empty_when_no_expired_reservations(): void
    {
        $user = User::factory()->create();
        [$event, $seat] = $this->createEventWithSeat();
        // Active reservation (not expired)
        Reservation::create([
            'seat_id'    => $seat->id,
            'user_id'    => $user->id,
            'expires_at' => now()->addMinutes(5),
        ]);

        $response = $this->deleteJson('/internal/reservations/expired', [], [
            'X-Internal-Secret' => $this->internalSecret,
        ]);

        $response->assertStatus(200)->assertJson(['released' => []]);
        $this->assertDatabaseHas('reservations', ['seat_id' => $seat->id]);
        $this->assertDatabaseHas('seats', ['id' => $seat->id, 'estat' => 'RESERVAT']);
    }

    public function test_releases_one_expired_reservation(): void
    {
        $user = User::factory()->create();
        [$event, $seat] = $this->createEventWithSeat();
        Reservation::create([
            'seat_id'    => $seat->id,
            'user_id'    => $user->id,
            'expires_at' => now()->subMinutes(1),
        ]);

        $response = $this->deleteJson('/internal/reservations/expired', [], [
            'X-Internal-Secret' => $this->internalSecret,
        ]);

        $response->assertStatus(200);
        $released = $response->json('released');
        $this->assertCount(1, $released);
        $this->assertEquals($seat->id, $released[0]['seatId']);
        $this->assertEquals($event->id, $released[0]['eventId']);

        $this->assertDatabaseMissing('reservations', ['seat_id' => $seat->id]);
        $this->assertDatabaseHas('seats', ['id' => $seat->id, 'estat' => 'DISPONIBLE']);
    }

    public function test_releases_multiple_expired_reservations_across_events(): void
    {
        $user = User::factory()->create();
        [$event1, $seat1] = $this->createEventWithSeat();
        [$event2, $seat2] = $this->createEventWithSeat();

        Reservation::create([
            'seat_id'    => $seat1->id,
            'user_id'    => $user->id,
            'expires_at' => now()->subMinutes(2),
        ]);
        Reservation::create([
            'seat_id'    => $seat2->id,
            'user_id'    => $user->id,
            'expires_at' => now()->subMinutes(1),
        ]);

        $response = $this->deleteJson('/internal/reservations/expired', [], [
            'X-Internal-Secret' => $this->internalSecret,
        ]);

        $response->assertStatus(200);
        $released = $response->json('released');
        $this->assertCount(2, $released);

        $seatIds = array_column($released, 'seatId');
        $this->assertContains($seat1->id, $seatIds);
        $this->assertContains($seat2->id, $seatIds);

        $this->assertDatabaseMissing('reservations', ['seat_id' => $seat1->id]);
        $this->assertDatabaseMissing('reservations', ['seat_id' => $seat2->id]);
        $this->assertDatabaseHas('seats', ['id' => $seat1->id, 'estat' => 'DISPONIBLE']);
        $this->assertDatabaseHas('seats', ['id' => $seat2->id, 'estat' => 'DISPONIBLE']);
    }

    public function test_idempotent_no_error_when_reservation_already_released(): void
    {
        // No reservations in DB at all — simulates a seat already voluntarily released
        $response = $this->deleteJson('/internal/reservations/expired', [], [
            'X-Internal-Secret' => $this->internalSecret,
        ]);

        $response->assertStatus(200)->assertJson(['released' => []]);
    }

    public function test_returns_401_when_secret_is_missing(): void
    {
        $response = $this->deleteJson('/internal/reservations/expired');

        $response->assertStatus(401)->assertJson(['message' => 'Unauthorized']);
    }

    public function test_returns_401_when_secret_is_wrong(): void
    {
        $response = $this->deleteJson('/internal/reservations/expired', [], [
            'X-Internal-Secret' => 'wrong-secret',
        ]);

        $response->assertStatus(401)->assertJson(['message' => 'Unauthorized']);
    }
}

