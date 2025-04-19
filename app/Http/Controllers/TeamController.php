<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeamRequest;
use App\Http\Resources\TeamResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::with(['manager', 'project', 'members'])->get();

        return response()->json([
            'success' => true,
            'data' => TeamResource::collection($teams)
        ], 200);
    }

    public function store(TeamRequest $request)
    {
        $validated = $request->validated();

        $team = Team::create($validated);

        // Ajouter des membres si présents dans la requête
        if (isset($validated['members']) && is_array($validated['members'])) {
            $memberIds = collect($validated['members'])->pluck('user_id')->toArray();
            $team->members()->attach($memberIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Équipe créée avec succès',
            'data' => new TeamResource($team)
        ], 201);
    }

    public function show($id)
    {
        $team = Team::with(['manager', 'project', 'members'])->find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new TeamResource($team)
        ]);
    }

    public function update($id, TeamRequest $request)
    {
        $team = Team::find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        $validated = $request->validated();

        // Vérifier si le nouveau manager était un membre
        $newManagerWasMember = false;
        if ($team->manager_id != $validated['manager_id']) {
            $newManagerWasMember = $team->members()->where('user_id', $validated['manager_id'])->exists();

            // Si le nouveau manager était un membre, le retirer de la liste des membres
            if ($newManagerWasMember) {
                $team->members()->detach($validated['manager_id']);
            }
        }

        $team->update($validated);

        // Mettre à jour les membres si présents dans la requête
        if (isset($validated['members']) && is_array($validated['members'])) {
            $memberIds = collect($validated['members'])->pluck('user_id')->toArray();
            // Assurez-vous que le manager n'est pas dans la liste des membres
            $memberIds = array_filter($memberIds, function ($id) use ($validated) {
                return $id != $validated['manager_id'];
            });
            $team->members()->sync($memberIds);
        }

        return response()->noContent();
    }
    public function destroy($id)
    {
        $team = Team::find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        // Commencer une transaction pour s'assurer que tout est supprimé correctement
        DB::beginTransaction();
        try {
            // D'abord, supprimer les entrées de la table pivot team_user
            DB::table('team_user')->where('team_id', $id)->delete();

            // Ensuite, supprimer l'équipe elle-même
            $team->delete();

            // Valider la transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Équipe et ses membres supprimés avec succès'
            ]);
        } catch (\Exception $e) {
            // En cas d'erreur, annuler la transaction
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'équipe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Ajouter un membre à l'équipe
    public function addMember($teamId, Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $team = Team::find($teamId);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        // Vérifier si l'utilisateur est le manager de l'équipe
        if ($team->manager_id == $request->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cet utilisateur est déjà le chef d\'équipe'
            ], 400);
        }

        // Vérifier si le membre existe déjà dans l'équipe
        $memberExists = $team->members()->where('user_id', $request->user_id)->exists();

        if ($memberExists) {
            return response()->json([
                'success' => false,
                'message' => 'Ce membre fait déjà partie de l\'équipe'
            ], 400);
        }

        // Ajouter le membre puisqu'il n'existe pas encore dans l'équipe
        $team->members()->attach($request->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Membre ajouté avec succès'
        ], 200);
    }
    // Retirer un membre de l'équipe
    public function removeMember($teamId, $userId)
    {
        $team = Team::find($teamId);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        $team->members()->detach($userId);

        return response()->json([
            'success' => true,
            'message' => 'Membre retiré avec succès'
        ], 200);
    }

    // Récupérer les projets qui ne sont pas associés à une équipe
    public function getAvailableProjects()
    {
        // Récupérer les IDs des projets qui sont déjà associés à une équipe
        $assignedProjectIds = Team::pluck('project_id')->toArray();

        // Récupérer tous les projets qui ne sont pas dans cette liste
        $availableProjects = Project::whereNotIn('id', $assignedProjectIds)->get();

        return response()->json([
            'success' => true,
            'data' => $availableProjects
        ]);
    }



}