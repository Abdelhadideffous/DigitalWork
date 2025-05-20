<?php

namespace App\Listeners;

use App\Events\TaskCreated;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTaskCreatedNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    public function handle(TaskCreated $event)
    {
        $task = $event->task;

        if ($task->assigned_to) {
            NotificationService::send(
                $task->assigned_to,
                'Nouvelle tâche',
                "Une tâche vous a été assignée : {$task->title}",
                'info'
            );
        }
    }
}
