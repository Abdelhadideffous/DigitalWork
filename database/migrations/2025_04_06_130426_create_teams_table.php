<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ajout d'un nom pour l'équipe
            $table->text('description')->nullable(); // Description optionnelle
            $table->unsignedBigInteger('manager_id');
            $table->unsignedBigInteger('project_id'); // Correction de 'projet_id' à 'project_id'


            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};