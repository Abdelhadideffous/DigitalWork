<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('priorities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });


        // DB::table('priorities')->insert([
        //     ['name' => 'Basse'],
        //     ['name' => 'Moyenne'],
        //     ['name' => 'Haute'],
        //     ['name' => 'Critique'],
        // ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('priorities');
    }
};
