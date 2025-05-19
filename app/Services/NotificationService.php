<?php

namespace App\Services;

use App\Models\CommentsProject;
use App\Models\Team;
use App\Models\User;
use App\Models\EDB;
use App\Models\Task;
use App\Models\Subtask;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Envoyer une notification
     */
    private function sendNotification($userId, $title, $message, $type = 'info')
    {
        DB::table('notifications')->insert([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Notifications liées aux équipes
     */
    public function teamCreated(Team $team)
    {
        // Notification au manager
        $this->sendNotification(
            $team->manager_id,
            'Nouvelle équipe créée',
            "Vous avez été nommé manager de l'équipe '{$team->name}'",
            'success'
        );

        // Notifications aux membres
        foreach ($team->members as $member) {
            $this->sendNotification(
                $member->id,
                'Nouvelle équipe',
                "Vous avez été ajouté à l'équipe '{$team->name}'",
                'info'
            );
        }
    }

    public function teamUpdated(Team $team, $oldManagerId)
    {
        // Notification à l'ancien manager
        if ($oldManagerId !== $team->manager_id) {
            $this->sendNotification(
                $oldManagerId,
                'Changement de rôle',
                "Vous n'êtes plus manager de l'équipe '{$team->name}'",
                'warning'
            );

            // Notification au nouveau manager
            $this->sendNotification(
                $team->manager_id,
                'Nouveau rôle',
                "Vous êtes maintenant manager de l'équipe '{$team->name}'",
                'success'
            );
        }
    }

    public function memberAdded(Team $team, User $member)
    {
        // Notification au nouveau membre
        $this->sendNotification(
            $member->id,
            'Nouvelle équipe',
            "Vous avez été ajouté à l'équipe '{$team->name}'",
            'info'
        );

        // Notification au manager
        $this->sendNotification(
            $team->manager_id,
            'Nouveau membre',
            "{$member->name} a été ajouté à votre équipe '{$team->name}'",
            'info'
        );
    }

    public function memberRemoved(Team $team, User $member)
    {
        // Notification au membre retiré
        $this->sendNotification(
            $member->id,
            'Retrait d\'équipe',
            "Vous avez été retiré de l'équipe '{$team->name}'",
            'warning'
        );

        // Notification au manager
        $this->sendNotification(
            $team->manager_id,
            'Membre retiré',
            "{$member->name} a été retiré de votre équipe '{$team->name}'",
            'warning'
        );
    }

    /**
     * Notifications liées aux EDB
     */
    public function edbSubmitted(EDB $edb)
    {
        // Notification à TOUS les administrateurs
        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->sendNotification(
                $admin->id,
                'Nouvel EDB soumis',
                "Un nouvel EDB a été soumis par {$edb->user->name}",
                'info'
            );
        }

        // Notification à l'utilisateur lui-même
        $this->sendNotification(
            $edb->user_id,
            'EDB soumis',
            'Votre EDB a été soumis avec succès',
            'success'
        );
    }

    public function edbApproved(EDB $edb)
    {
        // Notification à l'utilisateur
        $this->sendNotification(
            $edb->user_id,
            'EDB approuvé',
            'Votre EDB a été approuvé',
            'success'
        );
    }

    public function edbRejected(EDB $edb)
    {
        // Notification à l'utilisateur
        $this->sendNotification(
            $edb->user_id,
            'EDB rejeté',
            'Votre EDB a été rejeté',
            'error'
        );
    }



    public function commentPosted(CommentsProject $comment): void
    {
        // Récupérer l’équipe qui gère le projet
        $team = Team::with(['project', 'manager', 'members'])
            ->where('project_id', $comment->project_id)
            ->first();

        if (!$team) {
            return; // Aucun team – rien à notifier
        }

        $title = $comment->parent_id
            ? "Nouvelle réponse sur « {$team->project->title} »"
            : "Nouveau commentaire sur « {$team->project->title} »";

        // Corps du message (on tronque pour ne pas dépasser)
        $preview = mb_strimwidth($comment->content, 0, 80, '…');
        $message = "{$comment->user->name} : « {$preview} »";

        // → Manager
        $this->sendNotification($team->manager_id, $title, $message, 'info');

        // → Tous les membres SAUF l’auteur (qui voit déjà son propre message)
        foreach ($team->members as $member) {
            if ($member->id !== $comment->user_id) {
                $this->sendNotification($member->id, $title, $message, 'info');
            }
        }
    }

    /**
     * Marquer toutes les notifications "commentaires" d’un projet comme lues
     * (utile quand on ouvre la page commentaires, par exemple)
     */
    public function markProjectCommentsAsRead(int $projectId, int $userId): void
    {
        DB::table('notifications')
            ->where('user_id', $userId)
            ->where('type', 'info')              // ou un type dédié, ex. 'comment'
            ->where('message', 'like', "%{$projectId}%") // si vous stockez l’ID dans le msg
            ->update(['is_read' => true]);
    }


    /**
     * Notifications liées aux tâches
     */
    public function taskAssigned(Task $task, User $assignee)
    {
        // Notification à l'assigné
        $this->sendNotification(
            $assignee->id,
            'Nouvelle tâche assignée',
            "Vous avez été assigné à la tâche '{$task->title}'",
            'info'
        );

        // Notification au créateur
        if ($task->creator_id !== $assignee->id) {
            $this->sendNotification(
                $task->creator_id,
                'Tâche assignée',
                "La tâche '{$task->title}' a été assignée à {$assignee->name}",
                'info'
            );
        }
    }

    public function taskCompleted(Task $task)
    {
        if ($task->assigned_to) {
            $this->sendNotification(
                $task->assigned_to,
                'Tâche terminée',
                "La tâche '{$task->title}' a été marquée comme terminée",
                'success'
            );
        }
    }

    public function taskUpdated(Task $task)
    {
        // // Notification au créateur si la mise à jour vient de l'assigné
        // if ($task->assignee_id && $task->assignee_id !== $task->creator_id) {
        //     $this->sendNotification(
        //         $task->creator_id,
        //         'Tâche mise à jour',
        //         "La tâche '{$task->title}' a été mise à jour",
        //         'info'
        //     );
        // }

        // // Notification à l'assigné si la mise à jour vient du créateur
        // if ($task->assignee_id && $task->assignee_id !== $task->creator_id) {
        //     $this->sendNotification(
        //         $task->assignee_id,
        //         'Tâche mise à jour',
        //         "La tâche '{$task->title}' a été mise à jour",
        //         'info'
        //     );
        // }
    }

    public function notifyManagerNewTask(Task $task, User $manager)
    {
        $this->sendNotification(
            $manager->id,
            'Nouvelle tâche créée',
            "Une nouvelle tâche '{$task->title}' a été créée dans votre projet",
            'task_created'
        );
    }

    public function notifyStatusChange(Task $task, User $manager)
    {
        $this->sendNotification(
            $manager->id,
            'Changement de statut',
            "Le statut de la tâche '{$task->title}' a été modifié",
            'status_changed'
        );
    }

    public function notifyTaskCompleted(Task $task, User $manager)
    {
        $this->sendNotification(
            $manager->id,
            'Tâche terminée',
            "La tâche '{$task->title}' a été marquée comme terminée",
            'task_completed'
        );
    }

    public function notifyTaskCancelled(Task $task, User $manager)
    {
        $this->sendNotification(
            $manager->id,
            'Tâche annulée',
            "La tâche '{$task->title}' a été annulée",
            'task_cancelled'
        );
    }

    public function notifyProgressUpdate(Task $task, User $manager)
    {
        $this->sendNotification(
            $manager->id,
            'Progression mise à jour',
            "La progression de la tâche '{$task->title}' a été mise à jour à {$task->progress}%",
            'progress_updated'
        );
    }

    /**
     * Notifications liées aux sous-tâches
     */
    public function subtaskCreated(Subtask $subtask)
    {
        $task = $subtask->task;
        if (!$task)
            return;


        // Notification au manager du projet
        if ($task->project && $task->project->manager_id) {
            $this->sendNotification(
                $task->project->manager_id,
                'Nouvelle sous-tâche créée',
                "Une nouvelle sous-tâche '{$subtask->title}' a été créée pour la tâche '{$task->title}'",
                'info'
            );
        }

        // //Notification à l'assigné de la tâche principale
        // if ($task->assigned_to) {
        //     $this->sendNotification(
        //         $task->assigned_to,
        //         'Nouvelle sous-tâche',
        //         "Une nouvelle sous-tâche '{$subtask->title}' a été ajoutée à votre tâche '{$task->title}'",
        //         'info'
        //     );
        // }

    }


    public function subtaskUpdated(Subtask $subtask)
    {
        $task = $subtask->task;
        if (!$task)
            return;

        // Notification au manager du projet
        if ($task->project && $task->project->manager_id) {
            $this->sendNotification(
                $task->project->manager_id,
                'Sous-tâche mise à jour',
                "La sous-tâche '{$subtask->title}' de la tâche '{$task->title}' a été mise à jour",
                'info'
            );
        }

        // Notification à l'assigné de la tâche principale
        if ($task->assigned_to) {
            $this->sendNotification(
                $task->assigned_to,
                'Sous-tâche mise à jour',
                "La sous-tâche '{$subtask->title}' de votre tâche '{$task->title}' a été mise à jour",
                'info'
            );
        }
    }

    public function subtaskCompleted(Subtask $subtask)
    {
        $task = $subtask->task;
        if (!$task)
            return;

        // Notification au manager du projet
        if ($task->project && $task->project->manager_id) {
            $this->sendNotification(
                $task->project->manager_id,
                'Sous-tâche terminée',
                "La sous-tâche '{$subtask->title}' de la tâche '{$task->title}' a été terminée",
                'success'
            );
        }

        // Notification à l'assigné de la tâche principale
        if ($task->assigned_to) {
            $this->sendNotification(
                $task->assigned_to,
                'Sous-tâche terminée',
                "La sous-tâche '{$subtask->title}' de votre tâche '{$task->title}' a été terminée",
                'success'
            );
        }
    }

    public function subtaskDeleted(Subtask $subtask)
    {
        $task = $subtask->task;
        if (!$task)
            return;

        // Notification au manager du projet
        if ($task->project && $task->project->manager_id) {
            $this->sendNotification(
                $task->project->manager_id,
                'Sous-tâche supprimée',
                "La sous-tâche '{$subtask->title}' de la tâche '{$task->title}' a été supprimée",
                'warning'
            );
        }

        // Notification à l'assigné de la tâche principale
        if ($task->assigned_to) {
            $this->sendNotification(
                $task->assigned_to,
                'Sous-tâche supprimée',
                "La sous-tâche '{$subtask->title}' de votre tâche '{$task->title}' a été supprimée",
                'warning'
            );
        }
    }

    public function subtaskProgressUpdated(Subtask $subtask)
    {
        $task = $subtask->task;
        if (!$task)
            return;

        // Notification au manager du projet si la progression a significativement changé
        if ($task->project && $task->project->manager_id) {
            $this->sendNotification(
                $task->project->manager_id,
                'Progression de sous-tâche mise à jour',
                "La progression de la sous-tâche '{$subtask->title}' de la tâche '{$task->title}' est maintenant à {$subtask->progress}%",
                'info'
            );
        }
    }




}