<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class LoginTest extends TestCase
{
    private function createUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'email' => 'user@example.com',
            'password' => 'password123',
            'role' => 'comprador',
        ], $attributes));
    }

    public function test_login_with_valid_credentials_returns_200_and_token(): void
    {
        $user = $this->createUser();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ])
            ->assertJsonPath('user.email', 'user@example.com')
            ->assertJsonPath('user.role', 'comprador');

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_login_with_wrong_password_returns_401(): void
    {
        $this->createUser();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'user@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Credencials incorrectes']);
    }

    public function test_login_with_unknown_email_returns_401(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'unknown@example.com',
            'password' => 'anypassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Credencials incorrectes']);
    }

    public function test_login_with_missing_fields_returns_422(): void
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_with_invalid_email_format_returns_422(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'no-es-un-email',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_endpoint_is_accessible_without_authentication(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'any@example.com',
            'password' => 'anypassword',
        ]);

        $response->assertStatus(401);
        $response->assertHeader('Content-Type', 'application/json');
    }
}
