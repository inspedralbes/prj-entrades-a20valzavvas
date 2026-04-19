<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminEventStatsTest extends TestCase
{
    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function compradorUser(): User
    {
        return User::factory()->create(['role' => 'comprador']);
    }

    private function createEventWithSeats(int $count, string $estat = 'DISPONIBLE'): array
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

        $seatIds = [];
        for ($i = 1; $i <= $count; $i++) {
            $seatId = (string) Str::uuid();
            $seatIds[] = $seatId;
            DB::table('seats')->insert([
                'id' => $seatId,
                'event_id' => $event->id,
                'price_category_id' => $categoryId,
                'row' => 'A',
                'number' => $i,
                'estat' => $estat,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return [$event, $categoryId, $seatIds];
    }

    public function test_stats_returns_correct_seat_counts(): void
    {
        $admin = $this->adminUser();
        [$event, $categoryId, $seatIds] = $this->createEventWithSeats(3);

        DB::table('seats')->where('id', $seatIds[0])->update(['estat' => 'DISPONIBLE']);
        DB::table('seats')->where('id', $seatIds[1])->update(['estat' => 'RESERVAT']);
        DB::table('seats')->where('id', $seatIds[2])->update(['estat' => 'VENUT']);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/events/{$event->id}/stats");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'disponibles',
                'reservats',
                'venuts',
                'totalSeients',
                'percentatgeVenuts',
                'percentatgeReservats',
                'usuaris',
                'reservesActives',
                'recaptacioTotal',
            ])
            ->assertJsonPath('disponibles', 1)
            ->assertJsonPath('reservats', 1)
            ->assertJsonPath('venuts', 1)
            ->assertJsonPath('totalSeients', 3);
    }

    public function test_stats_returns_correct_percentages(): void
    {
        $admin = $this->adminUser();
        [$event, , $seatIds] = $this->createEventWithSeats(4);

        DB::table('seats')->where('id', $seatIds[0])->update(['estat' => 'DISPONIBLE']);
        DB::table('seats')->where('id', $seatIds[1])->update(['estat' => 'DISPONIBLE']);
        DB::table('seats')->where('id', $seatIds[2])->update(['estat' => 'VENUT']);
        DB::table('seats')->where('id', $seatIds[3])->update(['estat' => 'VENUT']);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/events/{$event->id}/stats");

        $response->assertStatus(200);
        $this->assertEquals(50.0, (float) $response->json('percentatgeVenuts'));
        $this->assertEquals(0.0, (float) $response->json('percentatgeReservats'));
    }

    public function test_stats_counts_active_reservations(): void
    {
        $admin = $this->adminUser();
        $comprador = $this->compradorUser();
        [$event, , $seatIds] = $this->createEventWithSeats(2);

        $now = now();
        DB::table('reservations')->insert([
            'id' => (string) Str::uuid(),
            'seat_id' => $seatIds[0],
            'user_id' => $comprador->id,
            'expires_at' => now()->addMinutes(5),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/events/{$event->id}/stats");

        $response->assertStatus(200)
            ->assertJsonPath('reservesActives', 1);
    }

    public function test_stats_sums_revenue_from_order_items(): void
    {
        $admin = $this->adminUser();
        $comprador = $this->compradorUser();
        [$event, $categoryId, $seatIds] = $this->createEventWithSeats(1, 'VENUT');

        $now = now();
        $orderId = (string) Str::uuid();
        DB::table('orders')->insert([
            'id' => $orderId,
            'user_id' => $comprador->id,
            'total_amount' => 20.00,
            'status' => 'completed',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('order_items')->insert([
            'id' => (string) Str::uuid(),
            'order_id' => $orderId,
            'seat_id' => $seatIds[0],
            'price' => 20.00,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/events/{$event->id}/stats");

        $response->assertStatus(200);
        $this->assertEquals(20.00, (float) $response->json('recaptacioTotal'));
    }

    public function test_stats_returns_404_for_unknown_event(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/events/'.Str::uuid().'/stats');

        $response->assertStatus(404);
    }

    public function test_stats_returns_401_without_token(): void
    {
        $event = Event::factory()->create();

        $response = $this->getJson("/api/admin/events/{$event->id}/stats");

        $response->assertStatus(401);
    }

    public function test_stats_returns_403_for_comprador_role(): void
    {
        $comprador = $this->compradorUser();
        $event = Event::factory()->create();

        $response = $this->actingAs($comprador)
            ->getJson("/api/admin/events/{$event->id}/stats");

        $response->assertStatus(403);
    }
}
