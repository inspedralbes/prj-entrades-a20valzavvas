<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\User;
use App\Services\AdminEventService;
use Illuminate\Database\UniqueConstraintViolationException;
use Tests\TestCase;

class AdminEventStoreTest extends TestCase
{
    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Event',
            'date' => now()->addYear()->toIso8601String(),
            'venue' => 'Sala Test',
            'price_categories' => [
                [
                    'name' => 'General',
                    'price' => 10.00,
                    'rows' => ['A', 'B'],
                    'seats_per_row' => 5,
                ],
            ],
        ], $overrides);
    }

    public function test_store_creates_event_with_201(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id', 'name', 'slug', 'date', 'time', 'venue', 'published',
                'total_capacity', 'price_categories',
            ])
            ->assertJsonPath('published', false)
            ->assertJsonPath('total_capacity', 10); // 2 rows × 5 seats

        $this->assertDatabaseHas('events', ['name' => 'Test Event']);
        $this->assertDatabaseHas('price_categories', ['name' => 'General']);
    }

    public function test_store_creates_all_seats_with_estat_disponible(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload());

        // 2 rows × 5 seats = 10 seats
        $this->assertDatabaseCount('seats', 10);
        $this->assertEquals(0, \DB::table('seats')->where('estat', '!=', 'DISPONIBLE')->count());
    }

    public function test_store_auto_generates_slug_from_name(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload([
            'name' => 'Blade Runner 2049 4K',
        ]));

        $response->assertStatus(201)
            ->assertJsonPath('slug', 'blade-runner-2049-4k');
    }

    public function test_store_accepts_custom_slug(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload([
            'slug' => 'my-custom-slug',
        ]));

        $response->assertStatus(201)
            ->assertJsonPath('slug', 'my-custom-slug');
    }

    public function test_store_returns_409_for_duplicate_slug(): void
    {
        $admin = $this->adminUser();
        Event::factory()->create(['slug' => 'duplicate-slug']);

        $response = $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload([
            'slug' => 'duplicate-slug',
        ]));

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Slug already exists');

        $this->assertDatabaseCount('events', 1);
    }

    public function test_store_returns_422_for_past_date(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload([
            'date' => '2020-01-01T10:00:00',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date']);
    }

    public function test_store_returns_422_for_missing_required_fields(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/admin/events', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'date', 'venue', 'price_categories']);
    }

    public function test_store_returns_401_without_token(): void
    {
        $response = $this->postJson('/api/admin/events', $this->validPayload());

        $response->assertStatus(401);
    }

    public function test_store_returns_403_for_comprador_role(): void
    {
        $comprador = User::factory()->create(['role' => 'comprador']);

        $response = $this->actingAs($comprador)->postJson('/api/admin/events', $this->validPayload());

        $response->assertStatus(403);
    }

    public function test_store_returns_409_on_concurrent_slug_db_constraint(): void
    {
        // Simulates the race condition: two concurrent requests pass the pre-check
        // and the DB unique constraint fires on the second insert.
        $admin = $this->adminUser();

        $this->app->bind(AdminEventService::class, function () {
            $mock = $this->createMock(AdminEventService::class);
            $mock->method('store')->willThrow(
                new UniqueConstraintViolationException('pgsql', 'INSERT ...', [], new \Exception)
            );

            return $mock;
        });

        $response = $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload());

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Slug already exists');
    }

    public function test_store_does_not_persist_data_when_service_throws(): void
    {
        // Verifies that a mid-transaction failure leaves no orphaned records.
        $admin = $this->adminUser();

        $this->app->bind(AdminEventService::class, function () {
            $mock = $this->createMock(AdminEventService::class);
            $mock->method('store')->willThrow(new \RuntimeException('Unexpected error'));

            return $mock;
        });

        $this->actingAs($admin)->postJson('/api/admin/events', $this->validPayload());

        $this->assertDatabaseCount('events', 0);
        $this->assertDatabaseCount('price_categories', 0);
        $this->assertDatabaseCount('seats', 0);
    }
}
