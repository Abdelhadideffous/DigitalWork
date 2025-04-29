<?php

namespace App\Observers;

use App\Models\Project;

class ProjectObserver
{
    public function saved(Project $project)
    {
        $project->calculateProgress();
    }
    
    public function deleted(Project $project)
    {
        // Mettre à jour les entités parentes si nécessaire
    }
}
