<?php

namespace App\Listeners;

use App\Events\TaskCompleted;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTaskCompletedNotification
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
    public function handle(TaskCompleted $event): void
    {
        $task = $event->task;
        $doneById = $event->doneByUserId;

        $assigneeId = $task->assigned_to;
        $managerId  = $task->project->team->manager_id ?? null; // supposé structure : tâche → projet → team

        if ($doneById == $assigneeId && $managerId) {
            // l'employé termine la tâche → notifier le manager
            NotificationService::send(
                $managerId,
                'Tâche terminée',
                "L'employé a terminé la tâche : '{$task->title}'",
                'success'
            );
        } elseif ($doneById == $managerId && $assigneeId) {
            // le manager termine la tâche → notifier l'employé
            NotificationService::send(
                $assigneeId,
                'Tâche terminée',
                "Votre manager a terminé la tâche : '{$task->title}'",
                'success'
            );
        }
    }
}
