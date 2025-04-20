<?php

namespace Database\Seeders;

use App\Models\Statuses;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
{
    public function run()
    {
        $statuses = [
            ['name' => 'En attente'],
            ['name' => 'En cours'],
            ['name' => 'Terminé'],
            ['name' => 'Annulé'],
            ['name' => 'valide'],
            ['name' => 'rejete'],
        ];

        foreach ($statuses as $key => $value) {
            Statuses::create($value);
        }
    }
}
