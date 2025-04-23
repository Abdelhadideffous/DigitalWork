<?php

// app/Services/ProjectStatusUpdater.php
namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;

class TasktStatusUpdater
{
    public static function update()
    {
        $now = Carbon::now();
        Task::where('status_id', 1)
            ->whereDate('start_date', '<=', $now)
            ->update(['status_id' => 2]);
    }
}
