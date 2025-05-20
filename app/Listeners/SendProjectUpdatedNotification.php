<?php

namespace App\Listeners;

use App\Events\ProjectUpdated;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendProjectUpdatedNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ProjectUpdated $event): void
    {
        $project = $event->project;
        $managerId = $project->team->manager_id ?? null;

        if ($managerId) {
            NotificationService::send(
                $managerId,
                'Projet mis à jour',
                "Le projet '{$project->title}' a été modifié.",
                'info'
            );
        }

        foreach (optional($project->team)->members ?? [] as $member) {
            NotificationService::send(
                $member->id,
                'Projet mis à jour',
                "Le projet '{$project->title}' a été modifié.",
                'info'
            );
        }
    }
}

