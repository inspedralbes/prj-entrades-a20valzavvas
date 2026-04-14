<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Reservation;
use App\Models\Seat;
use App\Models\User;
use Tests\TestCase;

class SeatReservationControllerTest extends TestCase
{
    private function compradorUser(): User
    {
        return User::factory()->create(['role' => 'comprador']);
    }

    private function eventWithLimit(int $limit = 4): array
    {
        $event = Event::factory()->create([
            'published' => true,
            'max_seients_per_usuari' => $limit,
        ]);
        $category = PriceCategory::factory()->create(['event_id' => $event->id]);

        return [$event, $category];
    }

    private function activeReservation(User $user, Seat $seat): Reservation
    {
        $seat->update(['estat' => 'RESERVAT']);

        return Reservation::create([
            'seat_id' => $seat->id,
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(5),
        ]);
    }

    public function test_reserve_seat_returns_200_when_below_limit(): void
    {
        $user = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(4);

        // 3 existing active reservations (below limit of 4)
        for ($i = 1; $i <= 3; $i++) {
            $existingSeat = Seat::factory()->create([
                'event_id' => $event->id,
                'price_category_id' => $category->id,
                'row' => 'A',
                'number' => $i,
            ]);
            $this->activeReservation($user, $existingSeat);
        }

        $newSeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'B',
            'number' => 1,
            'estat' => 'DISPONIBLE',
        ]);

        $response = $this->actingAs($user)->postJson("/api/seats/{$newSeat->id}/reserve");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'reservation' => ['id', 'expires_at'],
                'seat' => ['id', 'fila', 'numero', 'estat'],
            ])
            ->assertJsonPath('seat.estat', 'RESERVAT');

        $this->assertDatabaseCount('reservations', 4);
        $this->assertEquals('RESERVAT', $newSeat->fresh()->estat);
    }

    public function test_reserve_seat_returns_422_when_limit_reached(): void
    {
        $user = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(4);

        // 4 existing active reservations (equals limit of 4)
        for ($i = 1; $i <= 4; $i++) {
            $existingSeat = Seat::factory()->create([
                'event_id' => $event->id,
                'price_category_id' => $category->id,
                'row' => 'A',
                'number' => $i,
            ]);
            $this->activeReservation($user, $existingSeat);
        }

        $newSeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'B',
            'number' => 1,
            'estat' => 'DISPONIBLE',
        ]);

        $response = $this->actingAs($user)->postJson("/api/seats/{$newSeat->id}/reserve");

        $response->assertStatus(422)
            ->assertJsonPath('motiu', 'limit_assolit');

        $this->assertDatabaseCount('reservations', 4); // No new reservation created
        $this->assertEquals('DISPONIBLE', $newSeat->fresh()->estat); // Seat unchanged
    }

    public function test_reserve_seat_returns_422_with_limit_of_1(): void
    {
        $user = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(1);

        $firstSeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'A',
            'number' => 1,
        ]);
        $this->activeReservation($user, $firstSeat);

        $secondSeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'A',
            'number' => 2,
            'estat' => 'DISPONIBLE',
        ]);

        $response = $this->actingAs($user)->postJson("/api/seats/{$secondSeat->id}/reserve");

        $response->assertStatus(422)
            ->assertJsonPath('motiu', 'limit_assolit');
    }

    public function test_expired_reservations_do_not_count_toward_limit(): void
    {
        $user = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(1);

        // An expired reservation (does not count toward the limit)
        $expiredSeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'A',
            'number' => 1,
        ]);
        Reservation::create([
            'seat_id' => $expiredSeat->id,
            'user_id' => $user->id,
            'expires_at' => now()->subMinutes(1), // already expired
        ]);

        $newSeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'A',
            'number' => 2,
            'estat' => 'DISPONIBLE',
        ]);

        $response = $this->actingAs($user)->postJson("/api/seats/{$newSeat->id}/reserve");

        $response->assertStatus(200);
    }

    public function test_limit_is_per_user_other_users_reservations_do_not_count(): void
    {
        $user = $this->compradorUser();
        $otherUser = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(1);

        // The other user has an active reservation
        $otherSeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'A',
            'number' => 1,
        ]);
        $this->activeReservation($otherUser, $otherSeat);

        // Our user tries to reserve a different seat
        $mySeat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'A',
            'number' => 2,
            'estat' => 'DISPONIBLE',
        ]);

        $response = $this->actingAs($user)->postJson("/api/seats/{$mySeat->id}/reserve");

        $response->assertStatus(200);
    }

    public function test_reserve_seat_returns_409_when_seat_already_reserved(): void
    {
        $user = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(4);

        $seat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => 'RESERVAT',
        ]);

        $response = $this->actingAs($user)->postJson("/api/seats/{$seat->id}/reserve");

        $response->assertStatus(409)
            ->assertJsonPath('motiu', 'no_disponible');
    }

    public function test_reserve_seat_returns_401_without_authentication(): void
    {
        $response = $this->postJson('/api/seats/some-seat-id/reserve');

        $response->assertStatus(401);
    }

    // ─── destroy (DELETE /api/seats/{seatId}/reserve) ─────────────────────────

    public function test_destroy_releases_own_reservation(): void
    {
        $user = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(4);

        $seat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'row' => 'C',
            'number' => 3,
        ]);
        $this->activeReservation($user, $seat);

        $response = $this->actingAs($user)->deleteJson("/api/seats/{$seat->id}/reserve");

        $response->assertStatus(204);
        $this->assertDatabaseCount('reservations', 0);
        $this->assertEquals('DISPONIBLE', $seat->fresh()->estat);
    }

    public function test_destroy_rejects_other_user_reservation(): void
    {
        $owner = $this->compradorUser();
        $intruder = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(4);

        $seat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
        ]);
        $this->activeReservation($owner, $seat);

        $response = $this->actingAs($intruder)->deleteJson("/api/seats/{$seat->id}/reserve");

        $response->assertStatus(403);
        $this->assertDatabaseCount('reservations', 1); // reservation unchanged
        $this->assertEquals('RESERVAT', $seat->fresh()->estat);
    }

    public function test_destroy_returns_404_if_reservation_not_found(): void
    {
        $user = $this->compradorUser();
        [$event, $category] = $this->eventWithLimit(4);

        $seat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => 'DISPONIBLE',
        ]);

        // No active reservation exists for this seat
        $response = $this->actingAs($user)->deleteJson("/api/seats/{$seat->id}/reserve");

        $response->assertStatus(404);
        $this->assertEquals('DISPONIBLE', $seat->fresh()->estat);
    }
}
