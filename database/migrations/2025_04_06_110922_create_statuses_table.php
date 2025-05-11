<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // // Ajouter des statuts par défaut
        // DB::table('statuses')->insert([
        //     ['name' => 'En attente'],
        //     ['name' => 'En cours'],
        //     ['name' => 'Terminé'],
        //     ['name' => 'Annulé'],
        // ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('statuses');
    }
};