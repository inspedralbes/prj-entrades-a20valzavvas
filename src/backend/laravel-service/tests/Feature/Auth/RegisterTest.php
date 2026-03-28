<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class RegisterTest extends TestCase
{
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $overrides);
    }

    public function test_successful_registration_returns_201_with_token_and_user(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ])
            ->assertJsonPath('user.role', 'comprador')
            ->assertJsonPath('user.email', 'test@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'comprador',
        ]);
    }

    public function test_duplicate_email_returns_422_with_email_error(): void
    {
        $this->postJson('/api/auth/register', $this->validPayload());

        $response = $this->postJson('/api/auth/register', $this->validPayload());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_empty_payload_returns_422_with_errors_for_required_fields(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_mismatched_password_confirmation_returns_422(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload([
            'password_confirmation' => 'different-password',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_password_shorter_than_8_characters_returns_422(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload([
            'password' => '1234567',
            'password_confirmation' => '1234567',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_invalid_email_format_returns_422(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload([
            'email' => 'no-es-un-email',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
