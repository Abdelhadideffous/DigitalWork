<?php

use App\Models\Project;
use App\Observers\ProjectObserver;

class EventServiceProvider
{
    public function boot()
    {
        Project::observe(ProjectObserver::class);
    }
}