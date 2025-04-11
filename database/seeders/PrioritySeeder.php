<?php




namespace Database\Seeders;

use App\Models\Priority;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrioritySeeder extends Seeder
{



    //php artisan migrate:refresh --seed

    // php artisan db:seed --class=PrioritySeeder

    public function run()
    {

        $priorities = [
            ['name' => 'Basse'],
            ['name' => 'Moyenne'],
            ['name' => 'Haute'],
            ['name' => 'Critique'],
        ];

        foreach ($priorities as $key => $value) {
            Priority::create($value);
        }


    }
}
