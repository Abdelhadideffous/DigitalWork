<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('users')->insert([
            // [
            //     'name' => 'Amine Khalil',
            //     'email' => 'amine.khalil@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Sara Lounis',
            //     'email' => 'sara.lounis@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Yassine Benali',
            //     'email' => 'yassine.benali@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Layla Mebarki',
            //     'email' => 'layla.mebarki@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Rachid Ouali',
            //     'email' => 'rachid.ouali@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Nadia Cherif',
            //     'email' => 'nadia.cherif@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Omar Slimani',
            //     'email' => 'omar.slimani@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Salma Yacine',
            //     'email' => 'salma.yacine@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Mohamed Zidane',
            //     'email' => 'mohamed.zidane@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],
            // [
            //     'name' => 'Hana Rami',
            //     'email' => 'hana.rami@example.com',
            //     'password' => Hash::make('password123'),
            //     'created_at' => $now,
            //     'updated_at' => $now,
            // ],

            // [
            //     'name'     => 'Admin',
            //     'email'    => 'admin@mail.com',
            //     'role'     => 'admin',
            //     'password' => Hash::make('password123'),
            //     'number'   => '0660987635',
            // ],

            [
                'name'     => 'badi test',
                'email'    => 'badi@mail.com',
                'role'     => 'admin',
                'password' => Hash::make('password123'),
                'number'   => '0779876567',
            ]


            
                  

        ]);


    }
}
