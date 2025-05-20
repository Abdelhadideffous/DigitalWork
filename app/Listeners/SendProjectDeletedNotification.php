<?php

namespace App\Listeners;

use App\Events\ProjectDeleted;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendProjectDeletedNotification
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
    public function handle(ProjectDeleted $event): void
    {
        $project = $event->project;
        $managerId = $project->team->manager_id ?? null;

        if ($managerId) {
            NotificationService::send(
                $managerId,
                'Projet supprimé',
                "Le projet '{$project->title}' auquel vous étiez associé a été supprimé.",
                'warning'
            );
        }

        foreach (optional($project->team)->members ?? [] as $member) {
            NotificationService::send(
                $member->id,
                'Projet supprimé',
                "Le projet '{$project->title}' auquel vous étiez associé a été supprimé.",
                'warning'
            );
        }
    }
}
