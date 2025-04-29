<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedTinyInteger('progress')->default(0);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->FLOAT ('progress')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('progress');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('progress');
        });
    }
};
