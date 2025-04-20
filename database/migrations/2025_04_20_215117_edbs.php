<?php

// database/migrations/xxxx_create_edbs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('edbs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('objectif')->nullable();
            $table->string('contrainte')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('status_id')->default(1);
            $table->unsignedBigInteger('priority_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edbs');
    }
};
