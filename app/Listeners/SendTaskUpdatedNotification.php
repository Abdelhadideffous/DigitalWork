<?php

namespace App\Listeners;

use App\Events\TaskUpdated;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTaskUpdatedNotification
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
    public function handle(TaskUpdated $event): void
    {
        $task = $event->task;
        $changes = $event->changes;

        // Cas assignation changée
        if (isset($changes['assigned_to'])) {
            [$oldId, $newId] = $changes['assigned_to'];

            if ($oldId) {
                NotificationService::send(
                    $oldId,
                    'Tâche réaffectée',
                    "La tâche '{$task->title}' ne vous est plus assignée.",
                    'warning'
                );
            }

            if ($newId) {
                NotificationService::send(
                    $newId,
                    'Nouvelle tâche assignée',
                    "Vous avez été assigné à la tâche : '{$task->title}'.",
                    'success'
                );
            }
        }

        // Cas autres modifications
        $messages = [];

        if (isset($changes['status_id'])) {
            $messages[] = "Le statut a été mis à jour.";
        }
        if (isset($changes['priority_id'])) {
            $messages[] = "La priorité a changé.";
        }
        if (isset($changes['start_date']) || isset($changes['end_date'])) {
            $messages[] = "Les dates ont été modifiées.";
        }

        // Notifier le nouvel assigné si autre chose a changé
        if (count($messages) && $task->assigned_to) {
            NotificationService::send(
                $task->assigned_to,
                'Mise à jour de tâche',
                "La tâche '{$task->title}' a été modifiée : " . implode(' ', $messages),
                'info'
            );
        }
    }
}
