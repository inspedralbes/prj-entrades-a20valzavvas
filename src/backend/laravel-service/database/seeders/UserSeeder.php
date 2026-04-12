<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@salaonirica.cat'],
            [
                'name' => 'Admin Sala Onirica',
                'password' => 'password',
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'comprador@salaonirica.cat'],
            [
                'name' => 'Comprador Prova',
                'password' => 'password',
                'role' => 'comprador',
            ]
        );

        User::updateOrCreate(
            ['email' => 'comprador2@salaonirica.cat'],
            [
                'name' => 'Comprador Prova 2',
                'password' => 'password',
                'role' => 'comprador',
            ]
        );
    }
}
