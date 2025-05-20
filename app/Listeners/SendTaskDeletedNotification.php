<?php

namespace App\Listeners;

use App\Events\TaskDeleted;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTaskDeletedNotification
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
    public function handle(TaskDeleted $event): void
    {
        $task = $event->task;

        if ($task->assigned_to) {
            NotificationService::send(
                $task->assigned_to,
                'Tâche supprimée',
                "La tâche '{$task->title}' vous ayant été assignée a été supprimée.",
                'warning'
            );
        }
    }
}
