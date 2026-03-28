<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\HasApiTokens;
use Tests\TestCase;

class SanctumConfigTest extends TestCase
{
    public function test_sanctum_secret_is_read_from_jwt_secret_env(): void
    {
        config(['sanctum.secret' => 'test-jwt-secret']);

        $this->assertSame('test-jwt-secret', config('sanctum.secret'));
    }

    public function test_sanctum_expiration_is_read_from_env(): void
    {
        config(['sanctum.expiration' => 120]);

        $this->assertSame(120, config('sanctum.expiration'));
    }

    public function test_user_model_uses_has_api_tokens_trait(): void
    {
        $traits = class_uses_recursive(User::class);

        $this->assertArrayHasKey(HasApiTokens::class, $traits);
    }

    public function test_health_endpoint_returns_200_without_token(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200);
        $response->assertJson(['status' => 'ok']);
    }
}
