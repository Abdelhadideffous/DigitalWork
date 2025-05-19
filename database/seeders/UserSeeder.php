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
            [
                'name'     => 'Amine Khalil',
                'email'    => 'amine.khalil@example.com',
                'role'     => 'employé',
                'number'   => '0611122233',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Sara Lounis',
                'email'    => 'sara.lounis@example.com',
                'role'     => 'manager',
                'number'   => '0622233344',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Yassine Benali',
                'email'    => 'yassine.benali@example.com',
                'role'     => 'employé',
                'number'   => '0633344455',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Layla Mebarki',
                'email'    => 'layla.mebarki@example.com',
                'role'     => 'manager',
                'number'   => '0644455566',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Rachid Ouali',
                'email'    => 'rachid.ouali@example.com',
                'role'     => 'admin',
                'number'   => '0655566677',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Nadia Cherif',
                'email'    => 'nadia.cherif@example.com',
                'role'     => 'employé',
                'number'   => '0666677788',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Omar Slimani',
                'email'    => 'omar.slimani@example.com',
                'role'     => 'manager',
                'number'   => '0677788899',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Salma Yacine',
                'email'    => 'salma.yacine@example.com',
                'role'     => 'admin',
                'number'   => '0688899900',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Mohamed Zidane',
                'email'    => 'mohamed.zidane@example.com',
                'role'     => 'employé',
                'number'   => '0699900112',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'Hana Rami',
                'email'    => 'hana.rami@example.com',
                'role'     => 'manager',
                'number'   => '0600112233',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'     => 'badi test',
                'email'    => 'badi@mail.com',
                'role'     => 'admin',
                'number'   => '0679876567',
                'password' => Hash::make('password123'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

    }
}
