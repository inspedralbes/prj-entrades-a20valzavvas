<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\User;
use Tests\TestCase;

class AdminEventControllerTest extends TestCase
{
    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_index_returns_all_events_including_drafts(): void
    {
        $admin = $this->adminUser();

        Event::factory()->count(2)->create(['published' => true]);
        Event::factory()->draft()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/events');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_index_returns_correct_fields(): void
    {
        $admin = $this->adminUser();
        Event::factory()->create(['published' => false]);

        $response = $this->actingAs($admin)->getJson('/api/admin/events');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'nom',
                    'data',
                    'hora',
                    'recinte',
                    'publicat',
                    'seients_disponibles',
                    'seients_reservats',
                    'seients_venuts',
                ],
            ])
            ->assertJsonPath('0.publicat', false);
    }

    public function test_index_returns_401_without_token(): void
    {
        $response = $this->getJson('/api/admin/events');

        $response->assertStatus(401);
    }

    public function test_index_returns_403_for_comprador_role(): void
    {
        $comprador = User::factory()->create(['role' => 'comprador']);

        $response = $this->actingAs($comprador)->getJson('/api/admin/events');

        $response->assertStatus(403);
    }
}
