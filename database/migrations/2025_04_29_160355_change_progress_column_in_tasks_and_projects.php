<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->float('progress', 5, 2)->default(0.00)->change();
        });
        Schema::table('projects', function (Blueprint $table) {
            $table->float('progress', 5, 2)->default(0.00)->change();
        });
    }
    public function down(): void
    {
        Schema::table('tasks_and_projects', function (Blueprint $table) {
            //
        });
    }
};
