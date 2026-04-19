<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminEventUpdateTest extends TestCase
{
    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createEventWithSeat(array $eventOverrides = []): array
    {
        $event = Event::factory()->create($eventOverrides);
        $now = now();

        $categoryId = (string) Str::uuid();
        DB::table('price_categories')->insert([
            'id' => $categoryId,
            'event_id' => $event->id,
            'name' => 'General',
            'price' => 10.00,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $seatId = (string) Str::uuid();
        DB::table('seats')->insert([
            'id' => $seatId,
            'event_id' => $event->id,
            'price_category_id' => $categoryId,
            'row' => 'A',
            'number' => 1,
            'estat' => 'DISPONIBLE',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return [$event, $seatId];
    }

    // --- SHOW ---

    public function test_show_returns_event_with_200(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create(['name' => 'Dune 4K']);

        $response = $this->actingAs($admin)->getJson("/api/admin/events/{$event->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'slug', 'description', 'date', 'venue', 'published', 'price_categories'])
            ->assertJsonPath('name', 'Dune 4K');
    }

    public function test_show_returns_404_for_unknown_event(): void
    {
        $admin = $this->adminUser();
        $fakeId = (string) Str::uuid();

        $response = $this->actingAs($admin)->getJson("/api/admin/events/{$fakeId}");

        $response->assertStatus(404);
    }

    public function test_show_returns_401_without_token(): void
    {
        $event = Event::factory()->create();

        $response = $this->getJson("/api/admin/events/{$event->id}");

        $response->assertStatus(401);
    }

    // --- UPDATE ---

    public function test_update_updates_metadata_with_200(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create(['description' => 'Old description']);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'description' => 'Nova descripció actualitzada',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('description', 'Nova descripció actualitzada');

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'description' => 'Nova descripció actualitzada',
        ]);
    }

    public function test_update_updates_date_with_200(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create();
        $futureDate = now()->addYear()->format('Y-m-d H:i:s');

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'date' => $futureDate,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('events', ['id' => $event->id, 'date' => $futureDate]);
    }

    public function test_update_returns_404_for_unknown_event(): void
    {
        $admin = $this->adminUser();
        $fakeId = (string) Str::uuid();

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$fakeId}", [
            'description' => 'test',
        ]);

        $response->assertStatus(404);
    }

    public function test_update_returns_422_when_price_categories_sent_with_active_reservations(): void
    {
        $admin = $this->adminUser();
        [$event, $seatId] = $this->createEventWithSeat();
        $user = User::factory()->create();
        $now = now();

        DB::table('reservations')->insert([
            'id' => (string) Str::uuid(),
            'seat_id' => $seatId,
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(5),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'price_categories' => [['name' => 'VIP', 'price' => 20, 'rows' => ['A'], 'seats_per_row' => 5]],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'No és possible modificar les categories mentre hi ha reserves actives');
    }

    public function test_update_returns_422_when_price_categories_sent_with_order_items(): void
    {
        $admin = $this->adminUser();
        [$event, $seatId] = $this->createEventWithSeat();
        $user = User::factory()->create();
        $now = now();

        $orderId = (string) Str::uuid();
        DB::table('orders')->insert([
            'id' => $orderId,
            'user_id' => $user->id,
            'total_amount' => 10.00,
            'status' => 'completed',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('order_items')->insert([
            'id' => (string) Str::uuid(),
            'order_id' => $orderId,
            'seat_id' => $seatId,
            'price' => 10.00,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'price_categories' => [['name' => 'VIP', 'price' => 20, 'rows' => ['A'], 'seats_per_row' => 5]],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'No és possible modificar les categories mentre hi ha reserves actives');
    }

    public function test_update_allows_metadata_change_without_price_categories_when_reservations_exist(): void
    {
        $admin = $this->adminUser();
        [$event, $seatId] = $this->createEventWithSeat();
        $user = User::factory()->create();
        $now = now();

        DB::table('reservations')->insert([
            'id' => (string) Str::uuid(),
            'seat_id' => $seatId,
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(5),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'description' => 'Updated without changing categories',
        ]);

        $response->assertStatus(200);
    }

    public function test_update_returns_409_for_duplicate_slug(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create(['slug' => 'my-event']);
        Event::factory()->create(['slug' => 'already-taken']);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'slug' => 'already-taken',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Slug already exists');

        $this->assertDatabaseHas('events', ['id' => $event->id, 'slug' => 'my-event']);
    }

    public function test_update_allows_same_slug_for_same_event(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create(['slug' => 'my-event']);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'slug' => 'my-event',
        ]);

        $response->assertStatus(200);
    }

    public function test_update_returns_401_without_token(): void
    {
        $event = Event::factory()->create();

        $response = $this->putJson("/api/admin/events/{$event->id}", ['description' => 'test']);

        $response->assertStatus(401);
    }

    public function test_update_returns_403_for_comprador_role(): void
    {
        $comprador = User::factory()->create(['role' => 'comprador']);
        $event = Event::factory()->create();

        $response = $this->actingAs($comprador)->putJson("/api/admin/events/{$event->id}", [
            'description' => 'test',
        ]);

        $response->assertStatus(403);
    }

    public function test_update_publishes_event(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->draft()->create();

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'published' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('published', true);

        $this->assertDatabaseHas('events', ['id' => $event->id, 'published' => true]);
    }

    public function test_update_unpublishes_event(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create(['published' => true]);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'published' => false,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('published', false);

        $this->assertDatabaseHas('events', ['id' => $event->id, 'published' => false]);
    }

    public function test_cannot_unpublish_event_with_sold_tickets(): void
    {
        $admin = $this->adminUser();
        $buyer = User::factory()->create(['role' => 'comprador']);
        [$event, $seatId] = $this->createEventWithSeat(['published' => true]);

        $now = now();
        $orderId = (string) Str::uuid();
        DB::table('orders')->insert([
            'id' => $orderId,
            'user_id' => $buyer->id,
            'total_amount' => 10.00,
            'status' => 'completed',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('order_items')->insert([
            'id' => (string) Str::uuid(),
            'order_id' => $orderId,
            'seat_id' => $seatId,
            'price' => 10.00,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $response = $this->actingAs($admin)->putJson("/api/admin/events/{$event->id}", [
            'published' => false,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('code', 'has_sold_tickets');

        $this->assertDatabaseHas('events', ['id' => $event->id, 'published' => true]);
    }
}
