<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminReportsTest extends TestCase
{
    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function compradorUser(): User
    {
        return User::factory()->create(['role' => 'comprador']);
    }

    private function createCategoryWithSeats(Event $event, string $name, float $price, int $total, int $sold): array
    {
        $now = now();
        $categoryId = (string) Str::uuid();

        DB::table('price_categories')->insert([
            'id' => $categoryId,
            'event_id' => $event->id,
            'name' => $name,
            'price' => $price,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $seatIds = [];
        for ($i = 1; $i <= $total; $i++) {
            $seatId = (string) Str::uuid();
            $seatIds[] = $seatId;
            $estat = $i <= $sold ? 'VENUT' : 'DISPONIBLE';
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

        return [$categoryId, $seatIds];
    }

    private function createOrderItemsForSeats(array $seatIds, float $price, int $count): void
    {
        $now = now();
        $comprador = $this->compradorUser();

        $orderId = (string) Str::uuid();
        DB::table('orders')->insert([
            'id' => $orderId,
            'user_id' => $comprador->id,
            'status' => 'completed',
            'total_amount' => $price * $count,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        for ($i = 0; $i < $count; $i++) {
            DB::table('order_items')->insert([
                'id' => (string) Str::uuid(),
                'order_id' => $orderId,
                'seat_id' => $seatIds[$i],
                'price' => $price,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function test_reports_returns_correct_data_with_sales(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create(['name' => 'Dune 4K']);

        [$vipCategoryId, $vipSeatIds] = $this->createCategoryWithSeats($event, 'VIP', 50.00, 50, 10);
        $this->createOrderItemsForSeats($vipSeatIds, 50.00, 10);

        [$generalCategoryId, $generalSeatIds] = $this->createCategoryWithSeats($event, 'General', 25.00, 100, 30);
        $this->createOrderItemsForSeats($generalSeatIds, 25.00, 30);

        $response = $this->actingAs($admin)->getJson('/api/admin/reports');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'category_id',
                'event_nom',
                'nom',
                'preu',
                'total_seients',
                'seients_venuts',
                'percentatge_ocupacio',
                'recaptacio',
            ],
        ]);

        $rows = collect($response->json());

        $vip = $rows->firstWhere('nom', 'VIP');
        $this->assertNotNull($vip);
        $this->assertEquals('Dune 4K', $vip['event_nom']);
        $this->assertEquals(50, $vip['total_seients']);
        $this->assertEquals(10, $vip['seients_venuts']);
        $this->assertEquals(20.0, (float) $vip['percentatge_ocupacio']);
        $this->assertEquals('500.00', $vip['recaptacio']);

        $general = $rows->firstWhere('nom', 'General');
        $this->assertNotNull($general);
        $this->assertEquals('Dune 4K', $general['event_nom']);
        $this->assertEquals(100, $general['total_seients']);
        $this->assertEquals(30, $general['seients_venuts']);
        $this->assertEquals(30.0, (float) $general['percentatge_ocupacio']);
        $this->assertEquals('750.00', $general['recaptacio']);
    }

    public function test_reports_returns_zeros_for_category_without_sales(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create();

        $this->createCategoryWithSeats($event, 'General', 25.00, 20, 0);

        $response = $this->actingAs($admin)->getJson('/api/admin/reports');

        $response->assertStatus(200);

        $row = collect($response->json())->firstWhere('nom', 'General');
        $this->assertNotNull($row);
        $this->assertEquals(0, $row['seients_venuts']);
        $this->assertEquals(0.0, (float) $row['percentatge_ocupacio']);
        $this->assertEquals('0.00', $row['recaptacio']);
    }

    public function test_reports_no_division_by_zero_for_category_without_seats(): void
    {
        $admin = $this->adminUser();
        $event = Event::factory()->create();

        // Category with no seats at all
        $now = now();
        DB::table('price_categories')->insert([
            'id' => (string) Str::uuid(),
            'event_id' => $event->id,
            'name' => 'Premium',
            'price' => 100.00,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/reports');

        $response->assertStatus(200);

        $row = collect($response->json())->firstWhere('nom', 'Premium');
        $this->assertNotNull($row);
        $this->assertEquals(0, $row['total_seients']);
        $this->assertEquals(0.0, (float) $row['percentatge_ocupacio']);
    }

    public function test_reports_requires_admin_role(): void
    {
        $comprador = $this->compradorUser();

        $response = $this->actingAs($comprador)->getJson('/api/admin/reports');

        $response->assertStatus(403);
    }

    public function test_reports_requires_authentication(): void
    {
        $response = $this->getJson('/api/admin/reports');

        $response->assertStatus(401);
    }

    public function test_reports_returns_empty_array_when_no_categories(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->getJson('/api/admin/reports');

        $response->assertStatus(200)
            ->assertJson([]);
    }
}
