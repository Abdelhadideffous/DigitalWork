<?php

namespace App\Utils;

use App\Models\Project;
use App\Models\Team;
use Illuminate\Support\Facades\Auth;

class TeamUtils
{
    /**
     * Vérifie si l'utilisateur courant fait partie d'une équipe associée au projet
     *
     * @param int $projectId
     * @return bool
     */
    public static function isUserInProjectTeam(int $projectId): bool
    {
        $userId = Auth::id();

        // Vérifie si l'utilisateur est dans une équipe associée au projet
        $teamsCount = Team::where('project_id', $projectId)
            ->whereHas('members', function ($query) use ($userId) {
                $query->where('users.id', $userId);
            })
            ->count();

        // Vérifie également si l'utilisateur est manager d'une équipe du projet
        $managerTeamsCount = Team::where('project_id', $projectId)
            ->where('manager_id', $userId)
            ->count();

        return ($teamsCount > 0 || $managerTeamsCount > 0);
    }
}