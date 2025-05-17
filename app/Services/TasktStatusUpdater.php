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
        $today = Carbon::today();
        Task::where('status_id', 1)
            ->whereDate('start_date', '<=', $today)
            ->update(['status_id' => 2]);
    }
}
