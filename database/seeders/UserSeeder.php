<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'John Doe',
            'email' => 'admin@example.com',
            'password' => 'password123'
        ]);


        User::create([
            'name' => 'Marie Dupont',
            'email' => 'marie.dupont@example.com',
            'password' => 'password123'
        ]);

    }
}
