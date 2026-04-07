<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Tests\TestCase;

class EnsureAdminTest extends TestCase
{
    // Uses /api/admin/events as a representative admin route.
    // Role-based 401/403 coverage for specific endpoints is in AdminEventControllerTest.

    public function test_comprador_user_receives_403(): void
    {
        $comprador = User::factory()->create(['role' => 'comprador']);

        $response = $this->actingAs($comprador)->getJson('/api/admin/events');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }

    public function test_unauthenticated_request_receives_401(): void
    {
        $response = $this->getJson('/api/admin/events');

        $response->assertStatus(401);
    }
}
