<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PriceCategory;
use App\Models\Reservation;
use App\Models\Seat;
use App\Models\User;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    private function compradorUser(): User
    {
        return User::factory()->create(['role' => 'comprador']);
    }

    private function createSeatWithReservation(User $user, array $seatOverrides = []): array
    {
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create([
            'event_id' => $event->id,
            'price' => 25.00,
        ]);
        $seat = Seat::factory()->create(array_merge([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => 'RESERVAT',
        ], $seatOverrides));
        $reservation = Reservation::create([
            'seat_id' => $seat->id,
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(5),
        ]);

        return [$seat, $reservation, $category];
    }

    public function test_store_creates_order_marks_seats_venut_and_deletes_reservations(): void
    {
        $user = $this->compradorUser();
        [$seat1] = $this->createSeatWithReservation($user, ['row' => 'A', 'number' => 1]);
        [$seat2] = $this->createSeatWithReservation($user, ['row' => 'A', 'number' => 2]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'total_amount', 'items']);

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 2);
        $this->assertDatabaseCount('reservations', 0);
        $this->assertEquals('VENUT', $seat1->fresh()->estat);
        $this->assertEquals('VENUT', $seat2->fresh()->estat);

        $order = Order::first();
        $this->assertEquals('50.00', $order->total_amount);
    }

    public function test_store_returns_409_when_no_active_reservations(): void
    {
        $user = $this->compradorUser();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('error', 'No tens reserves actives.');
    }

    public function test_store_returns_409_when_all_reservations_are_expired(): void
    {
        $user = $this->compradorUser();
        $event = Event::factory()->create(['published' => true]);
        $category = PriceCategory::factory()->create(['event_id' => $event->id]);
        $seat = Seat::factory()->create([
            'event_id' => $event->id,
            'price_category_id' => $category->id,
            'estat' => 'RESERVAT',
        ]);
        Reservation::create([
            'seat_id' => $seat->id,
            'user_id' => $user->id,
            'expires_at' => now()->subMinutes(1),
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ]);

        $response->assertStatus(409);
    }

    public function test_store_returns_422_when_email_is_invalid(): void
    {
        $user = $this->compradorUser();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'no-es-un-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_store_returns_422_when_nom_is_missing(): void
    {
        $user = $this->compradorUser();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'email' => 'joan@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nom']);
    }

    public function test_store_returns_422_when_nom_exceeds_100_chars(): void
    {
        $user = $this->compradorUser();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => str_repeat('a', 101),
            'email' => 'joan@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nom']);
    }

    public function test_store_returns_401_without_authentication(): void
    {
        $response = $this->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ]);

        $response->assertStatus(401);
    }

    public function test_store_does_not_affect_other_users_reservations(): void
    {
        $user = $this->compradorUser();
        $otherUser = $this->compradorUser();

        [$seat] = $this->createSeatWithReservation($user);
        [$otherSeat] = $this->createSeatWithReservation($otherUser);

        $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ])->assertStatus(201);

        // Other user's reservation must remain untouched
        $this->assertEquals('RESERVAT', $otherSeat->fresh()->estat);
        $this->assertDatabaseCount('reservations', 1);
    }
}
