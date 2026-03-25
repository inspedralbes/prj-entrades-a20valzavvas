<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_seed_creates_dune_event(): void
    {
        $event = Event::where('slug', 'dune-4k-dolby-2026')->first();

        $this->assertNotNull($event);
        $this->assertEquals('Dune: Projecció Especial 4K Dolby Atmos', $event->name);
        $this->assertEquals('Sala Onirica', $event->venue);
        $this->assertEquals(200, $event->total_capacity);
        $this->assertEquals('2026-06-15 21:00:00', $event->date->format('Y-m-d H:i:s'));
    }

    public function test_seed_creates_two_price_categories(): void
    {
        $event = Event::where('slug', 'dune-4k-dolby-2026')->first();
        $categories = $event->priceCategories()->orderBy('name')->get();

        $this->assertCount(2, $categories);
        $this->assertEquals('General', $categories[0]->name);
        $this->assertEquals(25.00, $categories[0]->price);
        $this->assertEquals('VIP', $categories[1]->name);
        $this->assertEquals(50.00, $categories[1]->price);
    }

    public function test_seed_creates_200_seats(): void
    {
        $event = Event::where('slug', 'dune-4k-dolby-2026')->first();

        $this->assertEquals(200, $event->seats()->count());
    }

    public function test_vip_seats_assigned_to_rows_a_and_b(): void
    {
        $event = Event::where('slug', 'dune-4k-dolby-2026')->first();
        $vipSeats = $event->seats()
            ->whereHas('priceCategory', fn ($q) => $q->where('name', 'VIP'))
            ->count();

        $this->assertEquals(40, $vipSeats);
    }

    public function test_general_seats_assigned_to_rows_c_through_j(): void
    {
        $event = Event::where('slug', 'dune-4k-dolby-2026')->first();
        $generalSeats = $event->seats()
            ->whereHas('priceCategory', fn ($q) => $q->where('name', 'General'))
            ->count();

        $this->assertEquals(160, $generalSeats);
    }

    public function test_all_seats_are_disponible(): void
    {
        $event = Event::where('slug', 'dune-4k-dolby-2026')->first();
        $nonDisponible = $event->seats()->where('estat', '!=', 'DISPONIBLE')->count();

        $this->assertEquals(0, $nonDisponible);
    }

    public function test_seed_creates_admin_user(): void
    {
        $admin = User::where('email', 'admin@salaonirica.cat')->first();

        $this->assertNotNull($admin);
        $this->assertEquals('admin', $admin->role);
    }

    public function test_seed_creates_comprador_user(): void
    {
        $comprador = User::where('email', 'comprador@salaonirica.cat')->first();

        $this->assertNotNull($comprador);
        $this->assertEquals('comprador', $comprador->role);
    }

    public function test_seed_is_idempotent(): void
    {
        $this->seed();

        $event = Event::where('slug', 'dune-4k-dolby-2026')->first();

        $this->assertEquals(1, Event::where('slug', 'dune-4k-dolby-2026')->count());
        $this->assertEquals(200, $event->seats()->count());
        $this->assertEquals(2, $event->priceCategories()->count());
        $this->assertEquals(1, User::where('email', 'admin@salaonirica.cat')->count());
        $this->assertEquals(1, User::where('email', 'comprador@salaonirica.cat')->count());
    }
}
