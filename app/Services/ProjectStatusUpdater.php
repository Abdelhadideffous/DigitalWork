<?php

// app/Services/ProjectStatusUpdater.php
namespace App\Services;

use App\Models\Project;
use Carbon\Carbon;

class ProjectStatusUpdater
{
    public static function update()
    {
        $now = Carbon::now();
        Project::where('status_id', 1)
            ->whereDate('start_date', '<=', $now)
            ->update(['status_id' => 2]);
    }
}
