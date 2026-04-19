<?php

namespace Tests\Feature;

use App\Mail\OrderConfirmationMail;
use App\Models\Event;
use App\Models\Order;
use App\Models\PriceCategory;
use App\Models\Reservation;
use App\Models\Seat;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    private function compradorUser(): User
    {
        return User::factory()->create(['role' => 'comprador']);
    }

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
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

    public function test_store_returns_409_with_expired_seat_ids_when_seat_ids_provided(): void
    {
        $user = $this->compradorUser();
        [$seat1] = $this->createSeatWithReservation($user, ['row' => 'B', 'number' => 5]);
        [$seat2] = $this->createSeatWithReservation($user, ['row' => 'B', 'number' => 6]);

        // Simulate seat1's reservation expired (delete it as the cron would)
        Reservation::where('seat_id', $seat1->id)->delete();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
            'seat_ids' => [$seat1->id, $seat2->id],
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('seients_expirats', [$seat1->id]);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_store_returns_409_seients_expirats_when_all_seat_ids_expired(): void
    {
        $user = $this->compradorUser();
        [$seat1] = $this->createSeatWithReservation($user, ['row' => 'B', 'number' => 5]);
        [$seat2] = $this->createSeatWithReservation($user, ['row' => 'B', 'number' => 6]);

        // Simulate both reservations expired (cron deleted them)
        Reservation::where('user_id', $user->id)->delete();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
            'seat_ids' => [$seat1->id, $seat2->id],
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('seients_expirats', [$seat1->id, $seat2->id]);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_store_creates_order_successfully_with_seat_ids_all_active(): void
    {
        $user = $this->compradorUser();
        [$seat1] = $this->createSeatWithReservation($user, ['row' => 'B', 'number' => 5]);
        [$seat2] = $this->createSeatWithReservation($user, ['row' => 'B', 'number' => 6]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
            'seat_ids' => [$seat1->id, $seat2->id],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'total_amount', 'items']);

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('reservations', 0);
        $this->assertEquals('VENUT', $seat1->fresh()->estat);
        $this->assertEquals('VENUT', $seat2->fresh()->estat);
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

    // --- mail tests ---

    public function test_store_sends_confirmation_email_on_success(): void
    {
        Mail::fake();

        $user = $this->compradorUser();
        $this->createSeatWithReservation($user);

        $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ])->assertStatus(201);

        Mail::assertSent(OrderConfirmationMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email)
                && $mail->hasSubject('Confirmació de la teva compra');
        });
    }

    public function test_store_does_not_send_email_on_409_expired_seats(): void
    {
        Mail::fake();

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

        $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ])->assertStatus(409);

        Mail::assertNothingSent();
    }

    // --- index() tests ---

    public function test_index_returns_orders_for_authenticated_user(): void
    {
        $user = $this->compradorUser();
        [$seat1] = $this->createSeatWithReservation($user);
        [$seat2] = $this->createSeatWithReservation($user);

        $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ])->assertStatus(201);

        $response = $this->actingAs($user)->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonStructure([[
                'id', 'total_amount', 'status', 'created_at',
                'items' => [['id', 'price', 'seat' => ['id', 'row', 'number', 'price_category', 'event']]],
            ]]);
    }

    public function test_index_returns_empty_array_when_no_orders(): void
    {
        $user = $this->compradorUser();

        $response = $this->actingAs($user)->getJson('/api/orders');

        $response->assertStatus(200)->assertExactJson([]);
    }

    public function test_index_returns_401_without_authentication(): void
    {
        $response = $this->getJson('/api/orders');

        $response->assertStatus(401);
    }

    public function test_index_isolates_orders_between_users(): void
    {
        $userA = $this->compradorUser();
        $userB = $this->compradorUser();

        $this->createSeatWithReservation($userA);
        $this->actingAs($userA)->postJson('/api/orders', [
            'nom' => 'User A',
            'email' => 'a@example.com',
        ])->assertStatus(201);

        $this->createSeatWithReservation($userB);
        $this->actingAs($userB)->postJson('/api/orders', [
            'nom' => 'User B',
            'email' => 'b@example.com',
        ])->assertStatus(201);

        $response = $this->actingAs($userA)->getJson('/api/orders');

        $response->assertStatus(200)->assertJsonCount(1);
        $this->assertEquals($userA->id, Order::first()->user_id);
    }

    public function test_index_returns_orders_sorted_by_created_at_desc(): void
    {
        $user = $this->compradorUser();

        $this->createSeatWithReservation($user);
        $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan',
            'email' => 'joan@example.com',
        ])->assertStatus(201);

        $this->createSeatWithReservation($user);
        $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan',
            'email' => 'joan@example.com',
        ])->assertStatus(201);

        $response = $this->actingAs($user)->getJson('/api/orders');

        $response->assertStatus(200)->assertJsonCount(2);
        $orders = $response->json();
        $this->assertGreaterThanOrEqual($orders[1]['created_at'], $orders[0]['created_at']);
    }

    // --- EnsureBuyer middleware tests ---

    public function test_admin_cannot_create_order(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/orders', [
            'nom' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'El rol admin no pot realitzar compres');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_comprador_can_still_create_order(): void
    {
        $user = $this->compradorUser();
        $this->createSeatWithReservation($user);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'nom' => 'Joan García',
            'email' => 'joan@example.com',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('orders', 1);
    }
}
