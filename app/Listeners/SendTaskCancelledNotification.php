<?php

namespace App\Listeners;

use App\Events\TaskCancelled;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTaskCancelledNotification
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
    public function handle(TaskCancelled $event): void
    {
        $task = $event->task;

        if ($task->assigned_to) {
            NotificationService::send(
                $task->assigned_to,
                'Tâche annulée',
                "Votre manager a annulé la tâche : '{$task->title}'.",
                'warning'
            );
        }
    }
}
