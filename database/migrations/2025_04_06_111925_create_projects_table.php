<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique();
            $table->text('description');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedBigInteger('status_id')->default(1);
            $table->unsignedBigInteger('priority_id');

            // $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete(); 
            // $table->foreignId('status_id')->nullable()->constrained('statuses')->onDelete('set null');
            // $table->foreignId('priority_id')->nullable()->constrained('priorities')->onDelete('set null'); 
            // $table->integer('progress')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};