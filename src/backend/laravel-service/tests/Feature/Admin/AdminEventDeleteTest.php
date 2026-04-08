<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminEventDeleteTest extends TestCase
{
    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createEventWithSeat(): array
    {
        $event = Event::factory()->create();
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

    public function test_destroy_deletes_event_and_returns_204(): void
    {
        $admin = $this->adminUser();
        [$event] = $this->createEventWithSeat();

        $response = $this->actingAs($admin)->deleteJson("/api/admin/events/{$event->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
        $this->assertDatabaseMissing('price_categories', ['event_id' => $event->id]);
        $this->assertDatabaseMissing('seats', ['event_id' => $event->id]);
    }

    public function test_destroy_returns_422_when_active_reservations_exist(): void
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

        $response = $this->actingAs($admin)->deleteJson("/api/admin/events/{$event->id}");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'has_active_reservations_or_orders');
        $this->assertDatabaseHas('events', ['id' => $event->id]);
    }

    public function test_destroy_returns_422_when_order_items_exist(): void
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

        $response = $this->actingAs($admin)->deleteJson("/api/admin/events/{$event->id}");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'has_active_reservations_or_orders');
        $this->assertDatabaseHas('events', ['id' => $event->id]);
    }

    public function test_destroy_returns_404_for_unknown_event(): void
    {
        $admin = $this->adminUser();
        $fakeId = (string) Str::uuid();

        $response = $this->actingAs($admin)->deleteJson("/api/admin/events/{$fakeId}");

        $response->assertStatus(404);
    }

    public function test_destroy_returns_401_without_token(): void
    {
        $event = Event::factory()->create();

        $response = $this->deleteJson("/api/admin/events/{$event->id}");

        $response->assertStatus(401);
    }

    public function test_destroy_returns_403_for_comprador_role(): void
    {
        $comprador = User::factory()->create(['role' => 'comprador']);
        $event = Event::factory()->create();

        $response = $this->actingAs($comprador)->deleteJson("/api/admin/events/{$event->id}");

        $response->assertStatus(403);
    }
}
