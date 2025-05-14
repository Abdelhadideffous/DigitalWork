<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeamNotificationController extends Controller
{
    /**
     * Envoyer une notification à un utilisateur
     */
    private function sendNotification($userId, $title, $message, $type = 'info')
    {
        try {
            Notification::create([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'envoi de la notification: ' . $e->getMessage());
        }
    }

    /**
     * Envoyer une notification lors de la création d'une équipe
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

        // Notification aux membres si présents
        foreach ($team->members as $member) {
            $this->sendNotification(
                $member->id,
                'Nouvelle équipe',
                "Vous avez été ajouté à l'équipe '{$team->name}'",
                'info'
            );
        }
    }

    /**
     * Envoyer une notification lors de l'ajout d'un membre
     */
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
            "Un nouveau membre a été ajouté à votre équipe '{$team->name}'",
            'info'
        );
    }

    /**
     * Envoyer une notification lors du retrait d'un membre
     */
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
            "Un membre a été retiré de votre équipe '{$team->name}'",
            'warning'
        );
    }

    /**
     * Envoyer une notification lors de la mise à jour d'une équipe
     */
    public function teamUpdated(Team $team, array $changes)
    {
        // Notification au manager si le nom a changé
        if (isset($changes['name'])) {
            $this->sendNotification(
                $team->manager_id,
                'Équipe mise à jour',
                "Le nom de votre équipe a été modifié en '{$team->name}'",
                'info'
            );
        }

        // Notification aux membres si le nom a changé
        if (isset($changes['name'])) {
            foreach ($team->members as $member) {
                $this->sendNotification(
                    $member->id,
                    'Équipe mise à jour',
                    "Le nom de votre équipe a été modifié en '{$team->name}'",
                    'info'
                );
            }
        }
    }
} 